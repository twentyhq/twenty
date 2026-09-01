import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SimplifyStandardTaskNoteLayoutsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788299312343-simplify-standard-task-note-layouts.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION = {
  id: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: '20202020-0000-0000-0000-0000000000bb',
};
const CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-0000000000cc';
const CUSTOM_TASK_TAB_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000dd';

const TASK_LAYOUT_IDENTIFIERS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage;
const NOTE_LAYOUT_IDENTIFIERS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage;
const TASK_FIELDS_VIEW_IDENTIFIERS =
  STANDARD_OBJECTS.task.views.taskRecordPageFields;
const NOTE_FIELDS_VIEW_IDENTIFIERS =
  STANDARD_OBJECTS.note.views.noteRecordPageFields;

const TARGET_LAYOUTS = [
  {
    pageLayoutIdentifiers: TASK_LAYOUT_IDENTIFIERS,
    fieldsViewIdentifiers: TASK_FIELDS_VIEW_IDENTIFIERS,
  },
  {
    pageLayoutIdentifiers: NOTE_LAYOUT_IDENTIFIERS,
    fieldsViewIdentifiers: NOTE_FIELDS_VIEW_IDENTIFIERS,
  },
] as const;

const buildByUniversalIdentifierMap = <
  T extends { universalIdentifier: string },
>(
  flatEntities: T[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

const buildStandardFlatEntity = (universalIdentifier: string) => ({
  applicationId: STANDARD_APPLICATION.id,
  isActive: true,
  overrides: null,
  universalIdentifier,
});

const buildWorkspaceCache = ({
  hasCustomTaskTab = false,
  taskFieldsViewOverrides = null,
}: {
  hasCustomTaskTab?: boolean;
  taskFieldsViewOverrides?: object | null;
} = {}) => {
  const pageLayouts: Array<
    Record<string, unknown> & { universalIdentifier: string }
  > = [];
  const pageLayoutTabs: Array<
    Record<string, unknown> & { universalIdentifier: string }
  > = [];
  const pageLayoutWidgets: Array<
    Record<string, unknown> & { universalIdentifier: string }
  > = [];
  const views: Array<
    Record<string, unknown> & { universalIdentifier: string }
  > = [];
  const viewFields: Array<
    Record<string, unknown> & { universalIdentifier: string }
  > = [];
  const viewFieldGroups: Array<
    Record<string, unknown> & { universalIdentifier: string }
  > = [];

  for (const {
    pageLayoutIdentifiers,
    fieldsViewIdentifiers,
  } of TARGET_LAYOUTS) {
    const tabUniversalIdentifiers = Object.values(
      pageLayoutIdentifiers.tabs,
    ).map(({ universalIdentifier, widgets }) => {
      const widgetUniversalIdentifiers = Object.values(widgets).map(
        ({ universalIdentifier: widgetUniversalIdentifier }) => {
          pageLayoutWidgets.push(
            buildStandardFlatEntity(widgetUniversalIdentifier),
          );

          return widgetUniversalIdentifier;
        },
      );

      pageLayoutTabs.push({
        ...buildStandardFlatEntity(universalIdentifier),
        widgetUniversalIdentifiers,
      });

      return universalIdentifier;
    });

    if (
      hasCustomTaskTab &&
      pageLayoutIdentifiers.universalIdentifier ===
        TASK_LAYOUT_IDENTIFIERS.universalIdentifier
    ) {
      tabUniversalIdentifiers.push(CUSTOM_TASK_TAB_UNIVERSAL_IDENTIFIER);
      pageLayoutTabs.push({
        ...buildStandardFlatEntity(CUSTOM_TASK_TAB_UNIVERSAL_IDENTIFIER),
        applicationId: CUSTOM_APPLICATION_ID,
        widgetUniversalIdentifiers: [],
      });
    }

    pageLayouts.push({
      applicationId: STANDARD_APPLICATION.id,
      tabUniversalIdentifiers,
      universalIdentifier: pageLayoutIdentifiers.universalIdentifier,
    });

    const viewFieldUniversalIdentifiers = Object.values(
      fieldsViewIdentifiers.viewFields,
    ).map(({ universalIdentifier }) => {
      viewFields.push(buildStandardFlatEntity(universalIdentifier));

      return universalIdentifier;
    });
    const viewFieldGroupUniversalIdentifiers = Object.values(
      fieldsViewIdentifiers.viewFieldGroups,
    ).map(({ universalIdentifier }) => {
      viewFieldGroups.push(buildStandardFlatEntity(universalIdentifier));

      return universalIdentifier;
    });

    views.push({
      ...buildStandardFlatEntity(fieldsViewIdentifiers.universalIdentifier),
      overrides:
        fieldsViewIdentifiers.universalIdentifier ===
        TASK_FIELDS_VIEW_IDENTIFIERS.universalIdentifier
          ? taskFieldsViewOverrides
          : null,
      viewFieldGroupUniversalIdentifiers,
      viewFieldUniversalIdentifiers,
      viewFilterGroupUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      viewGroupUniversalIdentifiers: [],
      viewSortUniversalIdentifiers: [],
    });
  }

  return {
    flatPageLayoutMaps: buildByUniversalIdentifierMap(pageLayouts),
    flatPageLayoutTabMaps: buildByUniversalIdentifierMap(pageLayoutTabs),
    flatPageLayoutWidgetMaps: buildByUniversalIdentifierMap(pageLayoutWidgets),
    flatViewMaps: buildByUniversalIdentifierMap(views),
    flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
    flatViewFieldGroupMaps: buildByUniversalIdentifierMap(viewFieldGroups),
  };
};

describe('SimplifyStandardTaskNoteLayoutsCommand', () => {
  let command: SimplifyStandardTaskNoteLayoutsCommand;
  let getOrRecomputeMock: jest.Mock;
  let validateBuildAndRunWorkspaceMigrationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn().mockResolvedValue(buildWorkspaceCache());
    validateBuildAndRunWorkspaceMigrationMock = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    command = new SimplifyStandardTaskNoteLayoutsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: STANDARD_APPLICATION,
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration:
          validateBuildAndRunWorkspaceMigrationMock,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('deletes obsolete standard tabs, fields, and field groups through a workspace migration', async () => {
    await runOnWorkspace();

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];
    const operations = payload.allFlatEntityOperationByMetadataName;

    expect(operations.pageLayoutTab.flatEntityToDelete).toHaveLength(4);
    expect(operations.viewField.flatEntityToDelete).toHaveLength(10);
    expect(operations.viewFieldGroup.flatEntityToDelete).toHaveLength(2);
    expect(
      operations.pageLayoutTab.flatEntityToDelete.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      ),
    ).toEqual(
      expect.arrayContaining([
        TASK_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
        TASK_LAYOUT_IDENTIFIERS.tabs.files.universalIdentifier,
        NOTE_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
        NOTE_LAYOUT_IDENTIFIERS.tabs.files.universalIdentifier,
      ]),
    );
  });

  it('does not migrate a layout containing custom-application metadata', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildWorkspaceCache({ hasCustomTaskTab: true }),
    );

    await runOnWorkspace();

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];
    const deletedTabUniversalIdentifiers =
      payload.allFlatEntityOperationByMetadataName.pageLayoutTab.flatEntityToDelete.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      );

    expect(deletedTabUniversalIdentifiers).not.toContain(
      TASK_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
    );
    expect(deletedTabUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        NOTE_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
        NOTE_LAYOUT_IDENTIFIERS.tabs.files.universalIdentifier,
      ]),
    );
  });

  it('does not migrate a layout whose fields view has overrides', async () => {
    getOrRecomputeMock.mockResolvedValue(
      buildWorkspaceCache({ taskFieldsViewOverrides: { name: 'Custom' } }),
    );

    await runOnWorkspace();

    const [payload] = validateBuildAndRunWorkspaceMigrationMock.mock.calls[0];
    const deletedViewFieldUniversalIdentifiers =
      payload.allFlatEntityOperationByMetadataName.viewField.flatEntityToDelete.map(
        ({ universalIdentifier }: { universalIdentifier: string }) =>
          universalIdentifier,
      );

    expect(deletedViewFieldUniversalIdentifiers).not.toContain(
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFields.bodyV2.universalIdentifier,
    );
    expect(deletedViewFieldUniversalIdentifiers).toContain(
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFields.bodyV2.universalIdentifier,
    );
  });

  it('does not write metadata in dry-run mode', async () => {
    await runOnWorkspace(true);

    expect(validateBuildAndRunWorkspaceMigrationMock).not.toHaveBeenCalled();
  });

  it('throws a workspace migration builder exception when the migration fails', async () => {
    validateBuildAndRunWorkspaceMigrationMock.mockResolvedValue({
      status: 'fail',
    });

    await expect(runOnWorkspace()).rejects.toBeInstanceOf(
      WorkspaceMigrationBuilderException,
    );
  });
});
