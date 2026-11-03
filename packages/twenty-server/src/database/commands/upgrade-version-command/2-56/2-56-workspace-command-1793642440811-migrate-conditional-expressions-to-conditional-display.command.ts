import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { fastDeepEqual, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { compileLegacyConditionalExpression } from 'src/database/commands/upgrade-version-command/2-56/utils/compile-legacy-conditional-expression.util';
import { migrateConditionalDisplayOverrides } from 'src/database/commands/upgrade-version-command/2-56/utils/migrate-conditional-display-overrides.util';
import { migratePageLayoutWidgetConditionalDisplay } from 'src/database/commands/upgrade-version-command/2-56/utils/migrate-page-layout-widget-conditional-display.util';
import { restoreLegacyConditionalDisplayOverrides } from 'src/database/commands/upgrade-version-command/2-56/utils/restore-legacy-conditional-display-overrides.util';
import { restoreLegacyPageLayoutWidgetConditionalDisplay } from 'src/database/commands/upgrade-version-command/2-56/utils/restore-legacy-page-layout-widget-conditional-display.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type LegacyWidgetJsonLogicField } from 'src/engine/metadata-modules/flat-conditional-display/types/legacy-widget-json-logic-field.type';
import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFlatFieldMetadataByName } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadata-by-name.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { fromPageLayoutWidgetOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-overrides-to-universal-overrides.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.56.0', 1793642440811)
@Command({
  name: 'upgrade:2-56:migrate-conditional-expressions-to-conditional-display',
  description:
    'Compile the conditional expressions and legacy json-logic of command menu items and page layout widgets into conditional display trees, where a non-zero dry run failure count means those workspaces need a hand review before the real run; down restores device rules only, other converted json-logic stays a tree',
})
export class MigrateConditionalExpressionsToConditionalDisplayCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatCommandMenuItemMaps,
      flatPageLayoutWidgetMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatPageLayoutTabMaps,
      flatRoleMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatCommandMenuItemMaps',
      'flatPageLayoutWidgetMaps',
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
      'flatPageLayoutTabMaps',
      'flatRoleMaps',
    ]);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const counts = {
      commandsWithAvailability: 0,
      commandsWithPinned: 0,
      widgetsWithAvailability: 0,
      widgetsConvertedFromJsonLogic: 0,
      widgetsMovedFromDeviceExpression: 0,
      overrideEntriesConverted: 0,
      failures: 0,
    };

    const now = new Date().toISOString();

    const commandMenuItemsToUpdate = Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((flatCommandMenuItem): FlatCommandMenuItem[] => {
        const migrated = this.migrateOrCollectFailure({
          workspaceId,
          description: `commandMenuItem ${flatCommandMenuItem.universalIdentifier}`,
          isDryRun: options.dryRun,
          migrate: () => ({
            conditionalAvailability:
              flatCommandMenuItem.conditionalAvailability ??
              compileLegacyConditionalExpression(
                flatCommandMenuItem.conditionalAvailabilityExpression,
              ),
            conditionalPinned:
              flatCommandMenuItem.conditionalPinned ??
              compileLegacyConditionalExpression(
                flatCommandMenuItem.conditionalPinnedExpression,
              ),
          }),
        });

        if (!isDefined(migrated)) {
          counts.failures += 1;

          return [];
        }

        const isAvailabilityChanged =
          migrated.conditionalAvailability !==
          flatCommandMenuItem.conditionalAvailability;
        const isPinnedChanged =
          migrated.conditionalPinned !== flatCommandMenuItem.conditionalPinned;
        const isAvailabilityExpressionWithoutTree =
          isDefined(flatCommandMenuItem.conditionalAvailabilityExpression) &&
          !isDefined(migrated.conditionalAvailability);
        const isPinnedExpressionWithoutTree =
          isDefined(flatCommandMenuItem.conditionalPinnedExpression) &&
          !isDefined(migrated.conditionalPinned);

        if (
          !isAvailabilityChanged &&
          !isPinnedChanged &&
          !isAvailabilityExpressionWithoutTree &&
          !isPinnedExpressionWithoutTree
        ) {
          return [];
        }

        if (isAvailabilityChanged) {
          counts.commandsWithAvailability += 1;
        }

        if (isPinnedChanged) {
          counts.commandsWithPinned += 1;
        }

        return [
          {
            ...flatCommandMenuItem,
            conditionalAvailability: migrated.conditionalAvailability,
            universalConditionalAvailability: isAvailabilityChanged
              ? fromConditionalDisplayToUniversalConditionalDisplay({
                  conditionalDisplay: migrated.conditionalAvailability,
                  fieldMetadataUniversalIdentifierById:
                    flatFieldMetadataMaps.universalIdentifierById,
                  roleUniversalIdentifierById:
                    flatRoleMaps.universalIdentifierById,
                })
              : flatCommandMenuItem.universalConditionalAvailability,
            conditionalPinned: migrated.conditionalPinned,
            universalConditionalPinned: isPinnedChanged
              ? fromConditionalDisplayToUniversalConditionalDisplay({
                  conditionalDisplay: migrated.conditionalPinned,
                  fieldMetadataUniversalIdentifierById:
                    flatFieldMetadataMaps.universalIdentifierById,
                  roleUniversalIdentifierById:
                    flatRoleMaps.universalIdentifierById,
                })
              : flatCommandMenuItem.universalConditionalPinned,
            conditionalAvailabilityExpression:
              isAvailabilityExpressionWithoutTree
                ? null
                : flatCommandMenuItem.conditionalAvailabilityExpression,
            conditionalPinnedExpression: isPinnedExpressionWithoutTree
              ? null
              : flatCommandMenuItem.conditionalPinnedExpression,
            updatedAt: now,
          },
        ];
      });

    const pageLayoutWidgetsToUpdate = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((flatPageLayoutWidget): FlatPageLayoutWidget[] => {
        const resolveField = this.buildResolveField({
          objectMetadataId: flatPageLayoutWidget.objectMetadataId,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });

        const migrated = this.migrateOrCollectFailure({
          workspaceId,
          description: `pageLayoutWidget ${flatPageLayoutWidget.universalIdentifier}`,
          isDryRun: options.dryRun,
          migrate: () => {
            const migratedConditionalDisplay =
              migratePageLayoutWidgetConditionalDisplay({
                conditionalAvailabilityExpression:
                  flatPageLayoutWidget.conditionalAvailabilityExpression,
                conditionalAvailability:
                  flatPageLayoutWidget.conditionalAvailability,
                conditionalDisplay: flatPageLayoutWidget.conditionalDisplay,
                resolveField,
              });
            const migratedOverrides = migrateConditionalDisplayOverrides({
              overrides: flatPageLayoutWidget.overrides,
              conditionalDisplay: migratedConditionalDisplay.conditionalDisplay,
              authorContext: {
                workspaceCustomApplicationUniversalIdentifier:
                  workspaceCustomFlatApplication.universalIdentifier,
                ownerApplicationUniversalIdentifier:
                  flatPageLayoutWidget.applicationUniversalIdentifier,
              },
              resolveField,
            });

            return { ...migratedConditionalDisplay, ...migratedOverrides };
          },
        });

        if (!isDefined(migrated)) {
          counts.failures += 1;

          return [];
        }

        const isAvailabilityChanged =
          migrated.conditionalAvailability !==
          flatPageLayoutWidget.conditionalAvailability;
        const isConditionalDisplayChanged =
          migrated.conditionalDisplay !==
          flatPageLayoutWidget.conditionalDisplay;
        const isOverridesChanged =
          migrated.overrides !== flatPageLayoutWidget.overrides;

        if (
          !isAvailabilityChanged &&
          !isConditionalDisplayChanged &&
          !isOverridesChanged
        ) {
          return [];
        }

        if (isAvailabilityChanged) {
          counts.widgetsWithAvailability += 1;
        }

        switch (migrated.conditionalDisplayConversion) {
          case 'jsonLogic':
            counts.widgetsConvertedFromJsonLogic += 1;
            break;
          case 'deviceExpression':
            counts.widgetsMovedFromDeviceExpression += 1;
            break;
          case 'none':
            break;
        }

        counts.overrideEntriesConverted += migrated.convertedOverrideEntryCount;

        return [
          {
            ...flatPageLayoutWidget,
            conditionalAvailability: migrated.conditionalAvailability,
            universalConditionalAvailability:
              fromConditionalDisplayToUniversalConditionalDisplay({
                conditionalDisplay: migrated.conditionalAvailability,
                fieldMetadataUniversalIdentifierById:
                  flatFieldMetadataMaps.universalIdentifierById,
                roleUniversalIdentifierById:
                  flatRoleMaps.universalIdentifierById,
              }),
            conditionalDisplay: migrated.conditionalDisplay,
            universalConditionalDisplay: isConditionalDisplayChanged
              ? fromConditionalDisplayToUniversalConditionalDisplay({
                  conditionalDisplay: migrated.conditionalDisplay,
                  fieldMetadataUniversalIdentifierById:
                    flatFieldMetadataMaps.universalIdentifierById,
                  roleUniversalIdentifierById:
                    flatRoleMaps.universalIdentifierById,
                })
              : flatPageLayoutWidget.universalConditionalDisplay,
            overrides: migrated.overrides,
            universalOverrides:
              isOverridesChanged && isDefined(migrated.overrides)
                ? fromPageLayoutWidgetOverridesToUniversalOverrides({
                    overrides: migrated.overrides,
                    pageLayoutTabUniversalIdentifierById:
                      flatPageLayoutTabMaps.universalIdentifierById,
                    fieldMetadataUniversalIdentifierById:
                      flatFieldMetadataMaps.universalIdentifierById,
                    roleUniversalIdentifierById:
                      flatRoleMaps.universalIdentifierById,
                  })
                : flatPageLayoutWidget.universalOverrides,
            updatedAt: now,
          },
        ];
      });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${counts.commandsWithAvailability} command(s) with availability, ${counts.commandsWithPinned} command(s) with pinned, ${counts.widgetsWithAvailability} widget(s) with availability, ${counts.widgetsConvertedFromJsonLogic} widget(s) converted from json-logic, ${counts.widgetsMovedFromDeviceExpression} widget(s) moved from device expression to display, ${counts.overrideEntriesConverted} override entr(ies) converted, ${counts.failures} failure(s), updating ${commandMenuItemsToUpdate.length} command menu item(s) and ${pageLayoutWidgetsToUpdate.length} page layout widget(s)`,
    );

    if (options.dryRun) {
      return;
    }

    await this.runMigrationPerApplication({
      workspaceId,
      commandMenuItemsToUpdate,
      pageLayoutWidgetsToUpdate,
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatCommandMenuItemMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    const commandMenuItemsToRestore = Object.values(
      flatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((flatCommandMenuItem) => {
        const conditionalAvailability = isDefined(
          flatCommandMenuItem.conditionalAvailabilityExpression,
        )
          ? null
          : flatCommandMenuItem.conditionalAvailability;
        const conditionalPinned = isDefined(
          flatCommandMenuItem.conditionalPinnedExpression,
        )
          ? null
          : flatCommandMenuItem.conditionalPinned;

        if (
          conditionalAvailability ===
            flatCommandMenuItem.conditionalAvailability &&
          conditionalPinned === flatCommandMenuItem.conditionalPinned
        ) {
          return [];
        }

        return [
          {
            id: flatCommandMenuItem.id,
            conditionalAvailability,
            conditionalPinned,
          },
        ];
      });

    const pageLayoutWidgetsToRestore = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .flatMap((flatPageLayoutWidget) => {
        const conditionalDisplay =
          restoreLegacyPageLayoutWidgetConditionalDisplay({
            conditionalAvailabilityExpression:
              flatPageLayoutWidget.conditionalAvailabilityExpression,
            conditionalDisplay: flatPageLayoutWidget.conditionalDisplay,
          });
        const overrides = restoreLegacyConditionalDisplayOverrides(
          flatPageLayoutWidget.overrides,
        );
        const conditionalAvailability = isDefined(
          flatPageLayoutWidget.conditionalAvailabilityExpression,
        )
          ? null
          : flatPageLayoutWidget.conditionalAvailability;

        if (
          conditionalAvailability ===
            flatPageLayoutWidget.conditionalAvailability &&
          conditionalDisplay === flatPageLayoutWidget.conditionalDisplay &&
          fastDeepEqual(overrides, flatPageLayoutWidget.overrides)
        ) {
          return [];
        }

        return [
          {
            id: flatPageLayoutWidget.id,
            conditionalAvailability,
            conditionalDisplay,
            overrides,
          },
        ];
      });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: restoring the conditional expressions of ${commandMenuItemsToRestore.length} command menu item(s) and ${pageLayoutWidgetsToRestore.length} page layout widget(s)`,
    );

    if (options.dryRun) {
      return;
    }

    await this.coreDataSource.transaction(async (entityManager) => {
      await entityManager.query(
        `UPDATE core."commandMenuItem" AS "commandMenuItem"
         SET "conditionalAvailability" = restored."conditionalAvailability",
             "conditionalPinned" = restored."conditionalPinned",
             "updatedAt" = now()
         FROM jsonb_to_recordset($1::jsonb) AS restored(id uuid, "conditionalAvailability" jsonb, "conditionalPinned" jsonb)
         WHERE "commandMenuItem".id = restored.id AND "commandMenuItem"."workspaceId" = $2`,
        [JSON.stringify(commandMenuItemsToRestore), workspaceId],
      );
      await entityManager.query(
        `UPDATE core."pageLayoutWidget" AS "pageLayoutWidget"
         SET "conditionalAvailability" = restored."conditionalAvailability",
             "conditionalDisplay" = restored."conditionalDisplay",
             "overrides" = restored."overrides",
             "updatedAt" = now()
         FROM jsonb_to_recordset($1::jsonb) AS restored(id uuid, "conditionalAvailability" jsonb, "conditionalDisplay" jsonb, "overrides" jsonb)
         WHERE "pageLayoutWidget".id = restored.id AND "pageLayoutWidget"."workspaceId" = $2`,
        [JSON.stringify(pageLayoutWidgetsToRestore), workspaceId],
      );
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatCommandMenuItemMaps',
      'flatPageLayoutWidgetMaps',
    ]);
  }

  private buildResolveField({
    objectMetadataId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    objectMetadataId: string | null;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): (fieldName: string) => LegacyWidgetJsonLogicField | undefined {
    const flatObjectMetadata = isDefined(objectMetadataId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    return (fieldName) => {
      if (!isDefined(flatObjectMetadata)) {
        return undefined;
      }

      const flatFieldMetadata = findFlatFieldMetadataByName({
        fieldName,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      return isDefined(flatFieldMetadata)
        ? {
            fieldMetadataId: flatFieldMetadata.id,
            type: flatFieldMetadata.type,
          }
        : undefined;
    };
  }

  private migrateOrCollectFailure<TMigrated>({
    workspaceId,
    description,
    isDryRun,
    migrate,
  }: {
    workspaceId: string;
    description: string;
    isDryRun?: boolean;
    migrate: () => TMigrated;
  }): TMigrated | undefined {
    try {
      return migrate();
    } catch (error) {
      const failure = `Workspace ${workspaceId}: cannot migrate the conditional expressions of ${description}: ${error instanceof Error ? error.message : String(error)}`;

      if (!isDryRun) {
        throw new Error(failure);
      }

      this.logger.warn(`[DRY RUN] ${failure}`);

      return undefined;
    }
  }

  private async runMigrationPerApplication({
    workspaceId,
    commandMenuItemsToUpdate,
    pageLayoutWidgetsToUpdate,
  }: {
    workspaceId: string;
    commandMenuItemsToUpdate: FlatCommandMenuItem[];
    pageLayoutWidgetsToUpdate: FlatPageLayoutWidget[];
  }): Promise<void> {
    const applicationUniversalIdentifiers = new Set([
      ...commandMenuItemsToUpdate.map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
      ...pageLayoutWidgetsToUpdate.map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
    ]);

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const commandMenuItemsOfApplication = commandMenuItemsToUpdate.filter(
        (commandMenuItem) =>
          commandMenuItem.applicationUniversalIdentifier ===
          applicationUniversalIdentifier,
      );
      const pageLayoutWidgetsOfApplication = pageLayoutWidgetsToUpdate.filter(
        (pageLayoutWidget) =>
          pageLayoutWidget.applicationUniversalIdentifier ===
          applicationUniversalIdentifier,
      );

      const workspaceMigrationInput = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          ...(isNonEmptyArray(commandMenuItemsOfApplication)
            ? {
                commandMenuItem: {
                  flatEntityToCreate: [],
                  flatEntityToDelete: [],
                  flatEntityToUpdate: commandMenuItemsOfApplication,
                },
              }
            : {}),
          ...(isNonEmptyArray(pageLayoutWidgetsOfApplication)
            ? {
                pageLayoutWidget: {
                  flatEntityToCreate: [],
                  flatEntityToDelete: [],
                  flatEntityToUpdate: pageLayoutWidgetsOfApplication,
                },
              }
            : {}),
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              workspaceMigrationInput,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              workspaceMigrationInput,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to migrate the conditional expressions of application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
