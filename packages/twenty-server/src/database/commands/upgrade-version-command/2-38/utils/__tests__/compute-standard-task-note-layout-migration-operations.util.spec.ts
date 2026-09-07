import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { STANDARD_TASK_NOTE_LAYOUT_MIGRATION_TARGETS } from 'src/database/commands/upgrade-version-command/2-38/constants/standard-task-note-layout-migration-targets.constant';
import {
  computeStandardTaskNoteLayoutMigrationOperations,
  type TaskNoteLayoutMigrationFlatMaps,
} from 'src/database/commands/upgrade-version-command/2-38/utils/compute-standard-task-note-layout-migration-operations.util';

const STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-0000000000aa';
const CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-0000000000bb';
const CUSTOM_TASK_TAB_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000cc';

const PAGE_LAYOUT_IDENTIFIERS_BY_LABEL = {
  Task: STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage,
  Note: STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage,
};

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
  applicationId: STANDARD_APPLICATION_ID,
  isActive: true,
  overrides: null,
  universalIdentifier,
});

const buildFlatMaps = ({
  state = 'preMigration',
  hasCustomTaskTab = false,
  taskFieldsViewOverrides = null,
  missingTaskChild,
}: {
  state?: 'preMigration' | 'postMigration';
  hasCustomTaskTab?: boolean;
  taskFieldsViewOverrides?: object | null;
  missingTaskChild?: 'tab' | 'viewField';
} = {}): TaskNoteLayoutMigrationFlatMaps => {
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

  for (const targetLayout of STANDARD_TASK_NOTE_LAYOUT_MIGRATION_TARGETS) {
    const pageLayoutIdentifiers =
      PAGE_LAYOUT_IDENTIFIERS_BY_LABEL[targetLayout.label];
    const tabUniversalIdentifiers = [
      ...targetLayout[`${state}TabUniversalIdentifiers`],
    ];
    const viewFieldUniversalIdentifiers = [
      ...targetLayout[`${state}ViewFieldUniversalIdentifiers`],
    ];
    const viewFieldGroupUniversalIdentifiers = [
      ...targetLayout[`${state}ViewFieldGroupUniversalIdentifiers`],
    ];

    if (targetLayout.label === 'Task' && missingTaskChild === 'tab') {
      tabUniversalIdentifiers.pop();
    }

    if (targetLayout.label === 'Task' && missingTaskChild === 'viewField') {
      viewFieldUniversalIdentifiers.pop();
    }

    for (const { universalIdentifier, widgets } of Object.values(
      pageLayoutIdentifiers.tabs,
    )) {
      if (!tabUniversalIdentifiers.includes(universalIdentifier)) {
        continue;
      }

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
    }

    if (targetLayout.label === 'Task' && hasCustomTaskTab) {
      tabUniversalIdentifiers.push(CUSTOM_TASK_TAB_UNIVERSAL_IDENTIFIER);
      pageLayoutTabs.push({
        ...buildStandardFlatEntity(CUSTOM_TASK_TAB_UNIVERSAL_IDENTIFIER),
        applicationId: CUSTOM_APPLICATION_ID,
        widgetUniversalIdentifiers: [],
      });
    }

    pageLayouts.push({
      applicationId: STANDARD_APPLICATION_ID,
      tabUniversalIdentifiers,
      universalIdentifier: targetLayout.pageLayoutUniversalIdentifier,
    });

    for (const universalIdentifier of viewFieldUniversalIdentifiers) {
      viewFields.push(buildStandardFlatEntity(universalIdentifier));
    }

    for (const universalIdentifier of viewFieldGroupUniversalIdentifiers) {
      viewFieldGroups.push(buildStandardFlatEntity(universalIdentifier));
    }

    views.push({
      ...buildStandardFlatEntity(targetLayout.fieldsViewUniversalIdentifier),
      overrides: targetLayout.label === 'Task' ? taskFieldsViewOverrides : null,
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
  } as unknown as TaskNoteLayoutMigrationFlatMaps;
};

describe('computeStandardTaskNoteLayoutMigrationOperations', () => {
  const computeOperations = (flatMaps: TaskNoteLayoutMigrationFlatMaps) =>
    computeStandardTaskNoteLayoutMigrationOperations({
      flatMaps,
      standardApplicationId: STANDARD_APPLICATION_ID,
    });

  it('preserves the legacy view entity identifiers targeted by the upgrade', () => {
    expect(STANDARD_TASK_NOTE_LAYOUT_MIGRATION_TARGETS).toEqual([
      expect.objectContaining({
        label: 'Task',
        removedViewFieldGroupUniversalIdentifiers: [
          'e48c1875-31be-511f-b229-d85cecc319b3',
        ],
        removedViewFieldUniversalIdentifiers: [
          '1481e9a9-d79c-5d97-9ea3-0babff9d6535',
          'fc5d2a89-8d8d-56f2-96bd-fcde0a04e1cb',
          '6e98e5c0-e188-56f8-a5a8-1f6569e7b2e8',
          '466bec84-2ac8-5a73-9c44-43e905c29a6b',
          '2a224a0a-0fd7-5e0e-9872-53eaec638ebf',
        ],
      }),
      expect.objectContaining({
        label: 'Note',
        removedViewFieldGroupUniversalIdentifiers: [
          'f8b067db-b793-5b4e-b6c6-5b7884d436e0',
        ],
        removedViewFieldUniversalIdentifiers: [
          'de624e40-0c8e-58dc-ab30-4dc6239dd758',
          'e45009c4-c19a-5907-a18d-da1df196c788',
          'c367e175-8ded-5ef6-987f-7dafc91252da',
          '556a3d3e-cc58-5863-a36e-3f742f019676',
          'c4c7e2f7-3827-53e4-aae0-ef14dbd15ca2',
        ],
      }),
    ]);
  });

  it('returns obsolete standard tabs, fields, and groups for deletion', () => {
    const operations = computeOperations(buildFlatMaps());

    expect(operations.pageLayoutTabsToDelete).toHaveLength(4);
    expect(operations.viewFieldsToDelete).toHaveLength(10);
    expect(operations.viewFieldGroupsToDelete).toHaveLength(2);
    expect(operations.skippedLayouts).toEqual([]);
  });

  it('is idempotent for layouts already in the post-migration state', () => {
    const operations = computeOperations(
      buildFlatMaps({ state: 'postMigration' }),
    );

    expect(operations).toEqual({
      pageLayoutTabsToDelete: [],
      skippedLayouts: [],
      viewFieldGroupsToDelete: [],
      viewFieldsToDelete: [],
    });
  });

  it('skips a layout containing custom-application metadata', () => {
    const operations = computeOperations(
      buildFlatMaps({ hasCustomTaskTab: true }),
    );

    expect(operations.pageLayoutTabsToDelete).toHaveLength(2);
    expect(operations.skippedLayouts).toContainEqual({
      label: 'Task',
      reason: 'customized',
    });
  });

  it('skips a layout whose fields view has overrides', () => {
    const operations = computeOperations(
      buildFlatMaps({ taskFieldsViewOverrides: { name: 'Custom' } }),
    );

    expect(operations.viewFieldsToDelete).toHaveLength(5);
    expect(operations.skippedLayouts).toContainEqual({
      label: 'Task',
      reason: 'customized',
    });
  });

  it.each(['tab', 'viewField'] as const)(
    'skips a layout with a removed standard %s',
    (missingTaskChild) => {
      const operations = computeOperations(buildFlatMaps({ missingTaskChild }));

      expect(operations.pageLayoutTabsToDelete).toHaveLength(2);
      expect(operations.viewFieldsToDelete).toHaveLength(5);
      expect(operations.skippedLayouts).toContainEqual({
        label: 'Task',
        reason: 'customized',
      });
    },
  );
});
