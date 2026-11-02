import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { bindFieldsWidgetToExistingView } from 'src/database/commands/upgrade-version-command/2-42/utils/bind-fields-widget-to-existing-view.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { computeRecordPageViewFieldForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-page-view-field-for-existing-object.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const WORKSPACE_MEMBER = STANDARD_OBJECTS.workspaceMember;
const WORKSPACE_MEMBER_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workspaceMemberRecordPage;

const FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  WORKSPACE_MEMBER.views.workspaceMemberRecordPageFields.universalIdentifier;

const FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS = Object.values(
  WORKSPACE_MEMBER.views.workspaceMemberRecordPageFields.viewFieldGroups,
).map((viewFieldGroup) => viewFieldGroup.universalIdentifier);

const FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  WORKSPACE_MEMBER.views.workspaceMemberRecordPageFields.viewFields,
).map((viewField) => viewField.universalIdentifier);

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  WORKSPACE_MEMBER_RECORD_PAGE.universalIdentifier;

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  WORKSPACE_MEMBER_RECORD_PAGE.tabs.home.universalIdentifier;

const PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS = [HOME_TAB_UNIVERSAL_IDENTIFIER];

const FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  WORKSPACE_MEMBER_RECORD_PAGE.tabs.home.widgets.fields.universalIdentifier;

const PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
];

@RegisteredWorkspaceCommand('2.53.0', 1793192231470)
@Command({
  name: 'upgrade:2-53:sync-workspace-member-record-page',
  description:
    'Create the Workspace member record page layout and its fields view in existing workspaces, including existing custom relations.',
})
export class SyncWorkspaceMemberRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          WORKSPACE_MEMBER.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `workspace member object metadata does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingFieldsView =
      flatViewMaps.byUniversalIdentifier[FIELDS_VIEW_UNIVERSAL_IDENTIFIER];

    if (isDefined(existingFieldsView?.deletedAt)) {
      this.logger.warn(
        `The workspace member fields view was deleted in workspace ${workspaceId}, leaving the record page untouched`,
      );

      return;
    }

    const softDeletedParent = [
      {
        label: 'record page layout',
        flatEntity:
          flatPageLayoutMaps.byUniversalIdentifier[
            PAGE_LAYOUT_UNIVERSAL_IDENTIFIER
          ],
      },
      {
        label: 'home tab',
        flatEntity:
          flatPageLayoutTabMaps.byUniversalIdentifier[
            HOME_TAB_UNIVERSAL_IDENTIFIER
          ],
      },
    ].find(({ flatEntity }) => isDefined(flatEntity?.deletedAt));

    if (isDefined(softDeletedParent)) {
      this.logger.warn(
        `The workspace member ${softDeletedParent.label} was deleted in workspace ${workspaceId}, leaving the record page untouched`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const viewsToCreate = getStandardFlatEntitiesToCreateOrThrow<FlatView>({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
      existingFlatEntityMaps: flatViewMaps,
      universalIdentifiers: [FIELDS_VIEW_UNIVERSAL_IDENTIFIER],
    });

    const viewFieldGroupsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewFieldGroup>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatViewFieldGroupMaps,
        existingFlatEntityMaps: flatViewFieldGroupMaps,
        universalIdentifiers: FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
      });

    const existingFieldsViewFieldIdentifiers = new Set(
      Object.values(flatViewFieldMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (viewField) =>
            viewField.viewUniversalIdentifier ===
            FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        )
        .map((viewField) => viewField.fieldMetadataUniversalIdentifier),
    );

    const viewFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers: FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      }).filter((viewField) => {
        if (
          existingFieldsViewFieldIdentifiers.has(
            viewField.fieldMetadataUniversalIdentifier,
          )
        ) {
          return false;
        }

        const existingGroup = isDefined(
          viewField.viewFieldGroupUniversalIdentifier,
        )
          ? flatViewFieldGroupMaps.byUniversalIdentifier[
              viewField.viewFieldGroupUniversalIdentifier
            ]
          : undefined;

        if (isDefined(existingGroup?.deletedAt)) {
          return false;
        }

        if (
          isDefined(
            flatFieldMetadataMaps.byUniversalIdentifier[
              viewField.fieldMetadataUniversalIdentifier
            ],
          )
        ) {
          return true;
        }

        this.logger.warn(
          `Skipping workspace member record page view field ${viewField.universalIdentifier} for workspace ${workspaceId}: field metadata ${viewField.fieldMetadataUniversalIdentifier} does not exist`,
        );

        return false;
      });

    const pageLayoutsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayout>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutMaps,
        existingFlatEntityMaps: flatPageLayoutMaps,
        universalIdentifiers: [PAGE_LAYOUT_UNIVERSAL_IDENTIFIER],
      });

    const pageLayoutTabsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        existingFlatEntityMaps: flatPageLayoutTabMaps,
        universalIdentifiers: PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS,
      });

    const pageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
      }).map((flatPageLayoutWidget) =>
        bindFieldsWidgetToExistingView({
          flatPageLayoutWidget,
          fieldsWidgetUniversalIdentifier: FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
          existingFieldsView,
        }),
      );

    const recordPageViewFieldMaps = viewFieldsToCreate.reduce(
      (maps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity,
          flatEntityMaps: maps,
        }),
      flatViewFieldMaps,
    );
    const recordPageViewFieldGroupMaps = viewFieldGroupsToCreate.reduce(
      (maps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity,
          flatEntityMaps: maps,
        }),
      flatViewFieldGroupMaps,
    );
    const recordPageWidgetMaps = pageLayoutWidgetsToCreate.reduce(
      (maps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity,
          flatEntityMaps: maps,
        }),
      flatPageLayoutWidgetMaps,
    );
    const relationsGroupUniversalIdentifier =
      WORKSPACE_MEMBER.views.workspaceMemberRecordPageFields.viewFieldGroups
        .relations.universalIdentifier;
    const recordPageViewMaps = {
      ...flatViewMaps,
      byUniversalIdentifier: {
        ...flatViewMaps.byUniversalIdentifier,
        [FIELDS_VIEW_UNIVERSAL_IDENTIFIER]: {
          ...(existingFieldsView ?? viewsToCreate[0]),
          viewFieldUniversalIdentifiers: Object.values(
            recordPageViewFieldMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .filter(
              (viewField) =>
                viewField.viewUniversalIdentifier ===
                FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
            )
            .map((viewField) => viewField.universalIdentifier),
          viewFieldGroupUniversalIdentifiers: [
            relationsGroupUniversalIdentifier,
          ],
        },
      },
    };
    const customRelations = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) =>
          field.objectMetadataUniversalIdentifier ===
            WORKSPACE_MEMBER.universalIdentifier &&
          field.applicationUniversalIdentifier !==
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
          (field.type === FieldMetadataType.RELATION ||
            isMorphRelationHead(field)) &&
          resolveEffectiveUniversalFlatEntityProperty({
            metadataName: 'fieldMetadata',
            universalFlatEntity: field,
            property: 'isActive',
          }) &&
          !existingFieldsViewFieldIdentifiers.has(field.universalIdentifier),
      )
      .sort((firstField, secondField) =>
        firstField.name.localeCompare(secondField.name),
      );
    const customRelationViewFields: UniversalFlatViewField[] = [];

    for (const relation of customRelations) {
      const viewField = computeRecordPageViewFieldForExistingObject({
        sourceFlatFieldMetadata: relation,
        recordPageViewUniversalIdentifier: FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
        flatViewMaps: recordPageViewMaps,
        flatViewFieldMaps: recordPageViewFieldMaps,
        flatViewFieldGroupMaps: recordPageViewFieldGroupMaps,
        flatPageLayoutWidgetMaps: recordPageWidgetMaps,
      });

      if (
        !isDefined(viewField) ||
        viewField.viewFieldGroupUniversalIdentifier !==
          relationsGroupUniversalIdentifier ||
        isDefined(
          flatViewFieldMaps.byUniversalIdentifier[
            viewField.universalIdentifier
          ],
        )
      ) {
        continue;
      }

      customRelationViewFields.push({
        ...viewField,
        position: viewField.position + customRelationViewFields.length,
      });
    }

    const totalOperationCount =
      customRelationViewFields.length +
      viewsToCreate.length +
      viewFieldGroupsToCreate.length +
      viewFieldsToCreate.length +
      pageLayoutsToCreate.length +
      pageLayoutTabsToCreate.length +
      pageLayoutWidgetsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `workspace member record page already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${viewsToCreate.length} view(s), ${viewFieldGroupsToCreate.length} field group(s), ${viewFieldsToCreate.length} standard view field(s), ${customRelationViewFields.length} custom relation view field(s), ${pageLayoutsToCreate.length} layout(s), ${pageLayoutTabsToCreate.length} tab(s), ${pageLayoutWidgetsToCreate.length} widget(s)`,
    );

    if (isDryRun) {
      return;
    }

    const standardOperationCount =
      totalOperationCount - customRelationViewFields.length;

    if (standardOperationCount > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            shouldDeferActions: false,
            isSystemBuild: true,
            dryRun: isDryRun,
            workspaceId,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
            allFlatEntityOperationByMetadataName: {
              view: {
                flatEntityToCreate: viewsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              viewFieldGroup: {
                flatEntityToCreate: viewFieldGroupsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              viewField: {
                flatEntityToCreate: viewFieldsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              pageLayout: {
                flatEntityToCreate: pageLayoutsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              pageLayoutTab: {
                flatEntityToCreate: pageLayoutTabsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              pageLayoutWidget: {
                flatEntityToCreate: pageLayoutWidgetsToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to sync the workspace member record page for workspace ${workspaceId}`,
        );
      }
    }

    const viewFieldsByApplication = new Map<string, UniversalFlatViewField[]>();
    for (const viewField of customRelationViewFields) {
      const viewFields =
        viewFieldsByApplication.get(viewField.applicationUniversalIdentifier) ??
        [];
      viewFieldsByApplication.set(viewField.applicationUniversalIdentifier, [
        ...viewFields,
        viewField,
      ]);
    }

    for (const [
      applicationUniversalIdentifier,
      viewFields,
    ] of viewFieldsByApplication) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            shouldDeferActions: false,
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              viewField: {
                flatEntityToCreate: viewFields,
                flatEntityToUpdate: [],
                flatEntityToDelete: [],
              },
            },
          },
        );
      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to backfill workspace member relations for workspace ${workspaceId}`,
        );
      }
    }
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const maps = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);
    const pageLayouts = Object.values(
      maps.flatPageLayoutMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (layout) =>
          layout.universalIdentifier === PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      );
    const tabs = Object.values(maps.flatPageLayoutTabMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (tab) =>
          tab.pageLayoutUniversalIdentifier ===
          PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      );
    const tabIdentifiers = new Set(tabs.map((tab) => tab.universalIdentifier));
    const widgets = Object.values(
      maps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((widget) =>
        tabIdentifiers.has(widget.pageLayoutTabUniversalIdentifier),
      );
    const views = Object.values(maps.flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (view) => view.universalIdentifier === FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
      );
    const viewFields = Object.values(
      maps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) =>
          field.viewUniversalIdentifier === FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
      );
    const viewFieldGroups = Object.values(
      maps.flatViewFieldGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (group) =>
          group.viewUniversalIdentifier === FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
      );
    if (options.dryRun || pageLayouts.length + views.length === 0) {
      return;
    }
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: viewFields,
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: viewFieldGroups,
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: widgets,
            },
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: tabs,
            },
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: pageLayouts,
            },
            view: {
              flatEntityToCreate: [],
              flatEntityToUpdate: [],
              flatEntityToDelete: views,
            },
          },
        },
      );
    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
