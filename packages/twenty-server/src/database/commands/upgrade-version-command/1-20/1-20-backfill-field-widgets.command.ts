import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  CoreObjectNameSingular,
  FieldMetadataType,
  PageLayoutTabLayoutMode,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  GRID_POSITIONS,
  VERTICAL_LIST_LAYOUT_POSITIONS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const HOME_TAB_POSITION = 10;

const isActivityTargetField = (
  fieldName: string,
  objectNameSingular: string,
): boolean =>
  (objectNameSingular === CoreObjectNameSingular.Note &&
    fieldName === 'noteTargets') ||
  (objectNameSingular === CoreObjectNameSingular.Task &&
    fieldName === 'taskTargets');

const isJunctionRelationField = (field: FlatFieldMetadata): boolean => {
  const settings = field.settings as
    | { junctionTargetFieldId?: string }
    | undefined;

  return (
    isDefined(settings?.junctionTargetFieldId) &&
    typeof settings?.junctionTargetFieldId === 'string' &&
    settings.junctionTargetFieldId.length > 0
  );
};

const isRelationTargetAvailable = (
  targetObject: FlatObjectMetadata | undefined,
): boolean => {
  if (!isDefined(targetObject)) {
    return false;
  }

  if (targetObject.isRemote) {
    return false;
  }

  if (
    targetObject.isSystem &&
    targetObject.nameSingular !== CoreObjectNameSingular.WorkspaceMember
  ) {
    return false;
  }

  return true;
};

@Command({
  name: 'upgrade:1-20:backfill-field-widgets',
  description:
    'Backfill FIELD widgets for relation fields in existing page layouts',
})
export class BackfillFieldWidgetsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of FIELD widgets for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    // Build a set of fieldMetadataIds that already have a FIELD widget
    const existingFieldWidgetFieldIds = new Set<string>();

    for (const widget of Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(widget) &&
        widget.configuration?.configurationType ===
          WidgetConfigurationType.FIELD &&
        isDefined(widget.configuration.fieldMetadataId)
      ) {
        existingFieldWidgetFieldIds.add(widget.configuration.fieldMetadataId);
      }
    }

    // Build object ID → objectMetadata map
    const objectById = new Map<string, FlatObjectMetadata>();

    for (const obj of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (isDefined(obj)) {
        objectById.set(obj.id, obj);
      }
    }

    // Build object ID → RECORD_PAGE layout map
    const recordPageLayoutByObjectId = new Map<
      string,
      { id: string; universalIdentifier: string }
    >();

    for (const layout of Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(layout) &&
        layout.type === PageLayoutType.RECORD_PAGE &&
        isDefined(layout.objectMetadataId)
      ) {
        recordPageLayoutByObjectId.set(layout.objectMetadataId, {
          id: layout.id,
          universalIdentifier: layout.universalIdentifier,
        });
      }
    }

    // Build pageLayoutId → home tab map
    const homeTabByPageLayoutId = new Map<
      string,
      {
        id: string;
        universalIdentifier: string;
        widgetCount: number;
      }
    >();

    for (const tab of Object.values(
      flatPageLayoutTabMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(tab) &&
        tab.position === HOME_TAB_POSITION &&
        tab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
      ) {
        homeTabByPageLayoutId.set(tab.pageLayoutId, {
          id: tab.id,
          universalIdentifier: tab.universalIdentifier,
          widgetCount: tab.widgetIds?.length ?? 0,
        });
      }
    }

    // Group fields by objectMetadataId
    const fieldsByObjectId = new Map<string, FlatFieldMetadata[]>();

    // Map morphId → all field IDs sharing that morphId (for dedup)
    const fieldIdsByMorphId = new Map<string, string[]>();

    for (const field of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(field) || !isDefined(field.objectMetadataId)) {
        continue;
      }

      const list = fieldsByObjectId.get(field.objectMetadataId) ?? [];

      list.push(field);
      fieldsByObjectId.set(field.objectMetadataId, list);

      if (
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(field.morphId)
      ) {
        const morphFieldIds = fieldIdsByMorphId.get(field.morphId) ?? [];

        morphFieldIds.push(field.id);
        fieldIdsByMorphId.set(field.morphId, morphFieldIds);
      }
    }

    const now = new Date().toISOString();

    const standardWidgetsToCreate: FlatPageLayoutWidget[] = [];
    const customWidgetsToCreate: FlatPageLayoutWidget[] = [];
    const processedMorphIds = new Set<string>();

    for (const object of objectById.values()) {
      const pageLayout = recordPageLayoutByObjectId.get(object.id);

      if (!isDefined(pageLayout)) {
        continue;
      }

      const homeTab = homeTabByPageLayoutId.get(pageLayout.id);

      if (!isDefined(homeTab)) {
        continue;
      }

      const flatApplication: FlatApplication = object.isCustom
        ? workspaceCustomFlatApplication
        : twentyStandardFlatApplication;

      const targetList: FlatPageLayoutWidget[] = object.isCustom
        ? customWidgetsToCreate
        : standardWidgetsToCreate;

      const fields = fieldsByObjectId.get(object.id) ?? [];
      let nextWidgetIndex = homeTab.widgetCount;

      for (const field of fields) {
        if (
          field.type !== FieldMetadataType.RELATION &&
          field.type !== FieldMetadataType.MORPH_RELATION
        ) {
          continue;
        }

        if (isActivityTargetField(field.name, object.nameSingular)) {
          continue;
        }

        if (isJunctionRelationField(field)) {
          continue;
        }

        if (field.type === FieldMetadataType.RELATION) {
          const targetObject = isDefined(field.relationTargetObjectMetadataId)
            ? objectById.get(field.relationTargetObjectMetadataId)
            : undefined;

          if (!isRelationTargetAvailable(targetObject)) {
            continue;
          }
        }

        // For morph relations, skip if any sibling field (same morphId)
        // already has a widget or was already processed in this run
        if (
          field.type === FieldMetadataType.MORPH_RELATION &&
          isDefined(field.morphId)
        ) {
          if (processedMorphIds.has(field.morphId)) {
            continue;
          }

          const siblingFieldIds = fieldIdsByMorphId.get(field.morphId) ?? [];
          const alreadyHasWidget = siblingFieldIds.some((id) =>
            existingFieldWidgetFieldIds.has(id),
          );

          if (alreadyHasWidget) {
            continue;
          }

          processedMorphIds.add(field.morphId);
        }

        if (existingFieldWidgetFieldIds.has(field.id)) {
          continue;
        }

        const widget: FlatPageLayoutWidget = {
          id: v4(),
          universalIdentifier: v4(),
          applicationId: flatApplication.id,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
          workspaceId,
          pageLayoutTabId: homeTab.id,
          pageLayoutTabUniversalIdentifier: homeTab.universalIdentifier,
          title: field.label,
          type: WidgetType.FIELD,
          gridPosition: { ...GRID_POSITIONS.FULL_WIDTH },
          position: {
            ...VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
            index: nextWidgetIndex,
          },
          configuration: {
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: field.id,
            fieldDisplayMode: FieldDisplayMode.CARD,
          },
          universalConfiguration: {
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: field.universalIdentifier,
            fieldDisplayMode: FieldDisplayMode.CARD,
          },
          objectMetadataId: object.id,
          objectMetadataUniversalIdentifier: object.universalIdentifier,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          conditionalDisplay: null,
          overrides: null,
        };

        targetList.push(widget);
        existingFieldWidgetFieldIds.add(field.id);
        nextWidgetIndex++;
      }
    }

    const totalWidgets =
      standardWidgetsToCreate.length + customWidgetsToCreate.length;

    if (totalWidgets === 0) {
      this.logger.log(
        `All FIELD widgets already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `Found ${totalWidgets} FIELD widget(s) to create for workspace ${workspaceId} (${standardWidgetsToCreate.length} standard, ${customWidgetsToCreate.length} custom)`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${totalWidgets} FIELD widget(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (standardWidgetsToCreate.length > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              pageLayoutWidget: {
                flatEntityToCreate: standardWidgetsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to create standard FIELD widgets:\n${JSON.stringify(result, null, 2)}`,
        );
        throw new Error(
          `Failed to create standard FIELD widgets for workspace ${workspaceId}`,
        );
      }
    }

    if (customWidgetsToCreate.length > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              pageLayoutWidget: {
                flatEntityToCreate: customWidgetsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to create custom FIELD widgets:\n${JSON.stringify(result, null, 2)}`,
        );
        throw new Error(
          `Failed to create custom FIELD widgets for workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `Successfully created ${totalWidgets} FIELD widget(s) for workspace ${workspaceId}`,
    );
  }
}
