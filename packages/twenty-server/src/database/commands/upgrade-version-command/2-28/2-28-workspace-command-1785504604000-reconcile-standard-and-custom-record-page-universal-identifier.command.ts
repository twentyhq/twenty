import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  getPageLayoutTabUniversalIdentifier,
  getPageLayoutWidgetUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  getViewFieldGroupUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { invalidateRecordPageReconcileCache } from 'src/database/commands/upgrade-version-command/2-28/utils/invalidate-record-page-reconcile-cache.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type ReownUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
    key?: ViewKey;
  };
};

type ReownUpdates = {
  pageLayoutUpdates: ReownUpdate[];
  pageLayoutTabUpdates: ReownUpdate[];
  pageLayoutWidgetUpdates: ReownUpdate[];
  viewUpdates: ReownUpdate[];
  viewFieldUpdates: ReownUpdate[];
  viewFieldGroupUpdates: ReownUpdate[];
};

@RegisteredWorkspaceCommand('2.28.0', 1785504604000)
@Command({
  name: 'upgrade:2-28:reconcile-standard-and-custom-record-page-universal-identifier',
  description:
    'Re-own the system record-page stack of every object whose RECORD_PAGE layout belongs to the twenty-standard or workspace-custom application onto the engine convention: the layout gets the name-free deterministic universal identifier (getRecordPageLayoutUniversalIdentifier, object identifier + RECORD_PAGE discriminator), its standard/workspace-custom tabs and widgets get title-keyed derived identifiers, the FIELDS_WIDGET record-page view referenced by the layout FIELDS widget gets the name-free derived identifier (object identifier + FIELDS_WIDGET key) plus the reserved key backfill, its view fields get getSystemViewFieldUniversalIdentifier keyed on the application of the field they display (note the incremental-path rows hold underived v4 identifiers, not parent-derived values), and everything is flagged isSystemSideEffect. View field groups are flagged and re-owned only when authored by twenty-standard: groups are also created by the user-facing CRUD API, and user-created groups must keep isSystemSideEffect false or they lose their only non-cascade cleanup. App-authored tabs attached to the standard layout (e.g. fireflies, call-recorder) and app-declared custom record-page layouts (the frontend displays a custom layout over the system one when defined) are left untouched. Children reference their parents by primary key and widget universal configurations resolve view primary keys at flat-maps build time, so the re-own is a lossless update followed by a full flat-maps closure invalidation. Objects missing the stack entirely get it from the backfill-record-page command that runs next.',
})
export class ReconcileStandardAndCustomRecordPageUniversalIdentifierCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const engineOwnedApplicationUniversalIdentifiers = new Set([
      twentyStandardFlatApplication.universalIdentifier,
      workspaceCustomFlatApplication.universalIdentifier,
    ]);

    const reownUpdates = this.computeReownUpdates({
      workspaceId,
      engineOwnedApplicationUniversalIdentifiers,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    });

    const totalUpdateCount = Object.values(reownUpdates).reduce(
      (count, updates) => count + updates.length,
      0,
    );

    if (totalUpdateCount === 0) {
      this.logger.log(
        `No record-page stack to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling record-page stack for workspace ${workspaceId}: ${reownUpdates.pageLayoutUpdates.length} layout(s), ${reownUpdates.pageLayoutTabUpdates.length} tab(s), ${reownUpdates.pageLayoutWidgetUpdates.length} widget(s), ${reownUpdates.viewUpdates.length} view(s), ${reownUpdates.viewFieldUpdates.length} view field(s), ${reownUpdates.viewFieldGroupUpdates.length} view field group(s)`,
    );

    if (isDryRun) {
      return;
    }

    await this.viewRepository.manager.transaction(async (entityManager) => {
      const updatesByEntity: [
        (
          | typeof PageLayoutEntity
          | typeof PageLayoutTabEntity
          | typeof PageLayoutWidgetEntity
          | typeof ViewEntity
          | typeof ViewFieldEntity
          | typeof ViewFieldGroupEntity
        ),
        ReownUpdate[],
      ][] = [
        [PageLayoutEntity, reownUpdates.pageLayoutUpdates],
        [PageLayoutTabEntity, reownUpdates.pageLayoutTabUpdates],
        [PageLayoutWidgetEntity, reownUpdates.pageLayoutWidgetUpdates],
        [ViewEntity, reownUpdates.viewUpdates],
        [ViewFieldEntity, reownUpdates.viewFieldUpdates],
        [ViewFieldGroupEntity, reownUpdates.viewFieldGroupUpdates],
      ];

      for (const [entity, updates] of updatesByEntity) {
        const repository = entityManager.getRepository(entity);

        for (const { id, update } of updates) {
          await repository.update({ id, workspaceId }, update);
        }
      }
    });

    await invalidateRecordPageReconcileCache({
      workspaceId,
      workspaceMigrationRunnerService: this.workspaceMigrationRunnerService,
    });

    this.logger.log(
      `Reconciled record-page stack for workspace ${workspaceId} (${totalUpdateCount} row(s))`,
    );
  }

  private computeReownUpdates({
    workspaceId,
    engineOwnedApplicationUniversalIdentifiers,
    twentyStandardApplicationUniversalIdentifier,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  }: {
    workspaceId: string;
    engineOwnedApplicationUniversalIdentifiers: Set<string>;
    twentyStandardApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatPageLayoutMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): ReownUpdates {
    const reownUpdates: ReownUpdates = {
      pageLayoutUpdates: [],
      pageLayoutTabUpdates: [],
      pageLayoutWidgetUpdates: [],
      viewUpdates: [],
      viewFieldUpdates: [],
      viewFieldGroupUpdates: [],
    };

    for (const flatPageLayout of Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatPageLayout) ||
        flatPageLayout.type !== PageLayoutType.RECORD_PAGE ||
        isDefined(flatPageLayout.deletedAt) ||
        // App-declared custom record-page layouts are legitimate and stay
        // app-owned: the frontend prefers them over the system layout.
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatPageLayout.applicationUniversalIdentifier,
        ) ||
        !isDefined(flatPageLayout.objectMetadataUniversalIdentifier)
      ) {
        continue;
      }

      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          flatPageLayout.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Missing object for record-page layout ${flatPageLayout.id} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const derivedPageLayoutUniversalIdentifier =
        getRecordPageLayoutUniversalIdentifier({
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        });

      this.pushReownUpdate({
        updates: reownUpdates.pageLayoutUpdates,
        flatEntity: flatPageLayout,
        derivedUniversalIdentifier: derivedPageLayoutUniversalIdentifier,
      });

      this.computeTabReownUpdates({
        workspaceId,
        reownUpdates,
        flatPageLayout,
        derivedPageLayoutUniversalIdentifier,
        engineOwnedApplicationUniversalIdentifiers,
        flatObjectMetadata,
        flatViewMaps,
        flatViewFieldMaps,
        flatViewFieldGroupMaps,
        flatFieldMetadataMaps,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
        twentyStandardApplicationUniversalIdentifier,
      });
    }

    return reownUpdates;
  }

  private computeTabReownUpdates({
    workspaceId,
    reownUpdates,
    flatPageLayout,
    derivedPageLayoutUniversalIdentifier,
    engineOwnedApplicationUniversalIdentifiers,
    flatObjectMetadata,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatFieldMetadataMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
    twentyStandardApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
    reownUpdates: ReownUpdates;
    flatPageLayout: NonNullable<
      AllFlatEntityMaps['flatPageLayoutMaps']['byUniversalIdentifier'][string]
    >;
    derivedPageLayoutUniversalIdentifier: string;
    engineOwnedApplicationUniversalIdentifiers: Set<string>;
    flatObjectMetadata: NonNullable<
      AllFlatEntityMaps['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
    >;
    twentyStandardApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatFieldMetadataMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): void {
    const seenDerivedTabUniversalIdentifiers = new Set<string>();

    for (const tabUniversalIdentifier of flatPageLayout.tabUniversalIdentifiers) {
      const flatPageLayoutTab =
        flatPageLayoutTabMaps.byUniversalIdentifier[tabUniversalIdentifier];

      if (
        !isDefined(flatPageLayoutTab) ||
        isDefined(flatPageLayoutTab.deletedAt) ||
        // App-authored tabs attached to the engine layout stay app-owned.
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatPageLayoutTab.applicationUniversalIdentifier,
        )
      ) {
        continue;
      }

      const derivedTabUniversalIdentifier = getPageLayoutTabUniversalIdentifier(
        {
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          pageLayoutUniversalIdentifier: derivedPageLayoutUniversalIdentifier,
          title: flatPageLayoutTab.title,
        },
      );

      if (seenDerivedTabUniversalIdentifiers.has(derivedTabUniversalIdentifier)) {
        this.logger.warn(
          `Duplicate tab title "${flatPageLayoutTab.title}" on record-page layout ${flatPageLayout.id} in workspace ${workspaceId}, skipping tab ${flatPageLayoutTab.id}`,
        );
        continue;
      }
      seenDerivedTabUniversalIdentifiers.add(derivedTabUniversalIdentifier);

      this.pushReownUpdate({
        updates: reownUpdates.pageLayoutTabUpdates,
        flatEntity: flatPageLayoutTab,
        derivedUniversalIdentifier: derivedTabUniversalIdentifier,
      });

      this.computeWidgetReownUpdates({
        workspaceId,
        reownUpdates,
        flatPageLayoutTab,
        derivedTabUniversalIdentifier,
        engineOwnedApplicationUniversalIdentifiers,
        flatObjectMetadata,
        flatViewMaps,
        flatViewFieldMaps,
        flatViewFieldGroupMaps,
        flatFieldMetadataMaps,
        flatPageLayoutWidgetMaps,
        twentyStandardApplicationUniversalIdentifier,
      });
    }
  }

  private computeWidgetReownUpdates({
    workspaceId,
    reownUpdates,
    flatPageLayoutTab,
    derivedTabUniversalIdentifier,
    engineOwnedApplicationUniversalIdentifiers,
    flatObjectMetadata,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatFieldMetadataMaps,
    flatPageLayoutWidgetMaps,
    twentyStandardApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
    reownUpdates: ReownUpdates;
    flatPageLayoutTab: NonNullable<
      AllFlatEntityMaps['flatPageLayoutTabMaps']['byUniversalIdentifier'][string]
    >;
    derivedTabUniversalIdentifier: string;
    engineOwnedApplicationUniversalIdentifiers: Set<string>;
    flatObjectMetadata: NonNullable<
      AllFlatEntityMaps['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
    >;
    twentyStandardApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatFieldMetadataMaps'
    | 'flatPageLayoutWidgetMaps'
  >): void {
    const seenDerivedWidgetUniversalIdentifiers = new Set<string>();

    for (const widgetUniversalIdentifier of flatPageLayoutTab.widgetUniversalIdentifiers) {
      const flatPageLayoutWidget =
        flatPageLayoutWidgetMaps.byUniversalIdentifier[
          widgetUniversalIdentifier
        ];

      if (
        !isDefined(flatPageLayoutWidget) ||
        isDefined(flatPageLayoutWidget.deletedAt) ||
        !engineOwnedApplicationUniversalIdentifiers.has(
          flatPageLayoutWidget.applicationUniversalIdentifier,
        )
      ) {
        continue;
      }

      const derivedWidgetUniversalIdentifier =
        getPageLayoutWidgetUniversalIdentifier({
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          pageLayoutTabUniversalIdentifier: derivedTabUniversalIdentifier,
          title: flatPageLayoutWidget.title,
        });

      if (
        seenDerivedWidgetUniversalIdentifiers.has(
          derivedWidgetUniversalIdentifier,
        )
      ) {
        this.logger.warn(
          `Duplicate widget title "${flatPageLayoutWidget.title}" on tab ${flatPageLayoutTab.id} in workspace ${workspaceId}, skipping widget ${flatPageLayoutWidget.id}`,
        );
        continue;
      }
      seenDerivedWidgetUniversalIdentifiers.add(
        derivedWidgetUniversalIdentifier,
      );

      this.pushReownUpdate({
        updates: reownUpdates.pageLayoutWidgetUpdates,
        flatEntity: flatPageLayoutWidget,
        derivedUniversalIdentifier: derivedWidgetUniversalIdentifier,
      });

      if (
        flatPageLayoutWidget.configuration?.configurationType ===
        WidgetConfigurationType.FIELDS
      ) {
        this.computeRecordPageViewReownUpdates({
          workspaceId,
          reownUpdates,
          fieldsWidgetViewId: flatPageLayoutWidget.configuration.viewId,
          flatObjectMetadata,
          flatViewMaps,
          flatViewFieldMaps,
          flatViewFieldGroupMaps,
          flatFieldMetadataMaps,
          twentyStandardApplicationUniversalIdentifier,
        });
      }
    }
  }

  private computeRecordPageViewReownUpdates({
    workspaceId,
    reownUpdates,
    fieldsWidgetViewId,
    flatObjectMetadata,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatFieldMetadataMaps,
    twentyStandardApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
    reownUpdates: ReownUpdates;
    fieldsWidgetViewId: string | null;
    flatObjectMetadata: NonNullable<
      AllFlatEntityMaps['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
    >;
    twentyStandardApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatFieldMetadataMaps'
  >): void {
    if (!isDefined(fieldsWidgetViewId)) {
      return;
    }

    const viewUniversalIdentifier =
      flatViewMaps.universalIdentifierById[fieldsWidgetViewId];
    const flatView = isDefined(viewUniversalIdentifier)
      ? flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]
      : undefined;

    if (!isDefined(flatView) || isDefined(flatView.deletedAt)) {
      this.logger.warn(
        `Dangling FIELDS widget view ${fieldsWidgetViewId} for object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const derivedViewUniversalIdentifier = getSystemViewUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      viewKey: ViewKey.FIELDS_WIDGET,
    });

    const viewUpdate: ReownUpdate['update'] = {};

    if (flatView.universalIdentifier !== derivedViewUniversalIdentifier) {
      viewUpdate.universalIdentifier = derivedViewUniversalIdentifier;
    }
    if (!flatView.isSystemSideEffect) {
      viewUpdate.isSystemSideEffect = true;
    }
    // The key backfill bypasses the compare pipeline (key is toCompare: false).
    if (flatView.key !== ViewKey.FIELDS_WIDGET) {
      viewUpdate.key = ViewKey.FIELDS_WIDGET;
    }

    if (Object.keys(viewUpdate).length > 0) {
      reownUpdates.viewUpdates.push({ id: flatView.id, update: viewUpdate });
    }

    for (const viewFieldUniversalIdentifier of flatView.viewFieldUniversalIdentifiers) {
      const flatViewField =
        flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier];

      if (!isDefined(flatViewField) || isDefined(flatViewField.deletedAt)) {
        continue;
      }

      const flatFieldMetadata =
        flatFieldMetadataMaps.byUniversalIdentifier[
          flatViewField.fieldMetadataUniversalIdentifier
        ];

      if (!isDefined(flatFieldMetadata)) {
        this.logger.warn(
          `Missing field for record-page view field ${flatViewField.id} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      this.pushReownUpdate({
        updates: reownUpdates.viewFieldUpdates,
        flatEntity: flatViewField,
        derivedUniversalIdentifier: getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            flatFieldMetadata.applicationUniversalIdentifier,
          viewUniversalIdentifier: derivedViewUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatViewField.fieldMetadataUniversalIdentifier,
        }),
      });
    }

    this.computeViewFieldGroupReownUpdates({
      reownUpdates,
      flatView,
      derivedViewUniversalIdentifier,
      flatObjectMetadata,
      flatViewFieldGroupMaps,
      twentyStandardApplicationUniversalIdentifier,
    });
  }

  private computeViewFieldGroupReownUpdates({
    reownUpdates,
    flatView,
    derivedViewUniversalIdentifier,
    flatObjectMetadata,
    flatViewFieldGroupMaps,
    twentyStandardApplicationUniversalIdentifier,
  }: {
    reownUpdates: ReownUpdates;
    flatView: NonNullable<
      AllFlatEntityMaps['flatViewMaps']['byUniversalIdentifier'][string]
    >;
    derivedViewUniversalIdentifier: string;
    flatObjectMetadata: NonNullable<
      AllFlatEntityMaps['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
    >;
    twentyStandardApplicationUniversalIdentifier: string;
  } & Pick<AllFlatEntityMaps, 'flatViewFieldGroupMaps'>): void {
    for (const viewFieldGroupUniversalIdentifier of flatView.viewFieldGroupUniversalIdentifiers) {
      const flatViewFieldGroup =
        flatViewFieldGroupMaps.byUniversalIdentifier[
          viewFieldGroupUniversalIdentifier
        ];

      if (
        !isDefined(flatViewFieldGroup) ||
        isDefined(flatViewFieldGroup.deletedAt) ||
        // User-created groups (CRUD API) keep isSystemSideEffect false and
        // their own identifier; only standard-authored groups are re-owned.
        flatViewFieldGroup.applicationUniversalIdentifier !==
          twentyStandardApplicationUniversalIdentifier
      ) {
        continue;
      }

      this.pushReownUpdate({
        updates: reownUpdates.viewFieldGroupUpdates,
        flatEntity: flatViewFieldGroup,
        derivedUniversalIdentifier: getViewFieldGroupUniversalIdentifier({
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          viewUniversalIdentifier: derivedViewUniversalIdentifier,
          name: flatViewFieldGroup.name,
        }),
      });
    }
  }

  private pushReownUpdate({
    updates,
    flatEntity,
    derivedUniversalIdentifier,
  }: {
    updates: ReownUpdate[];
    flatEntity: {
      id: string;
      universalIdentifier: string;
      isSystemSideEffect: boolean;
    };
    derivedUniversalIdentifier: string;
  }): void {
    const update: ReownUpdate['update'] = {};

    if (flatEntity.universalIdentifier !== derivedUniversalIdentifier) {
      update.universalIdentifier = derivedUniversalIdentifier;
    }
    if (!flatEntity.isSystemSideEffect) {
      update.isSystemSideEffect = true;
    }

    if (Object.keys(update).length === 0) {
      return;
    }

    updates.push({ id: flatEntity.id, update });
  }
}
