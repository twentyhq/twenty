import { ViewType } from 'twenty-shared/types';

import { buildCompactListFlatViewUpdates } from 'src/database/commands/upgrade-version-command/2-64/utils/build-compact-list-flat-view-updates.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';
const STANDARD_APPLICATION = 'standard-application';
const NOW = '2026-11-25T00:00:00.000Z';

type FlatViewFixture = Parameters<
  typeof buildCompactListFlatViewUpdates
>[0]['flatViews'][number] & { universalIdentifier: string };

const buildFlatView = (
  flatView: Partial<FlatViewFixture> &
    Pick<FlatViewFixture, 'universalIdentifier' | 'type'>,
): FlatViewFixture => ({
  isCompact: false,
  overrides: null,
  universalOverrides: null,
  applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
  isSystemSideEffect: false,
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...flatView,
});

const build = (flatViews: FlatViewFixture[]) =>
  buildCompactListFlatViewUpdates({
    flatViews,
    fieldMetadataUniversalIdentifierById: {},
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    now: NOW,
  });

describe('buildCompactListFlatViewUpdates', () => {
  it('should set the column of a view that is a list by its own type, written by its owner', () => {
    const listViews = [
      buildFlatView({ universalIdentifier: 'list', type: ViewType.LIST }),
      buildFlatView({
        universalIdentifier: 'list-widget',
        type: ViewType.LIST_WIDGET,
      }),
      buildFlatView({
        universalIdentifier: 'standard-list',
        type: ViewType.LIST,
        applicationUniversalIdentifier: STANDARD_APPLICATION,
      }),
    ];

    expect(build(listViews)).toEqual(
      listViews.map((listView) => ({
        flatView: { ...listView, isCompact: true, updatedAt: NOW },
        writerApplicationUniversalIdentifier:
          listView.applicationUniversalIdentifier,
      })),
    );
  });

  it('should override Compact view, as the workspace, on a standard view the workspace turned into a list', () => {
    const standardTableShownAsList = buildFlatView({
      universalIdentifier: 'standard-table-shown-as-list',
      type: ViewType.TABLE,
      applicationUniversalIdentifier: STANDARD_APPLICATION,
      overrides: { [WORKSPACE_CUSTOM_APPLICATION]: { type: ViewType.LIST } },
    });
    const workspaceOverrides = {
      [WORKSPACE_CUSTOM_APPLICATION]: { type: ViewType.LIST, isCompact: true },
    };

    expect(build([standardTableShownAsList])).toEqual([
      {
        flatView: {
          ...standardTableShownAsList,
          overrides: workspaceOverrides,
          universalOverrides: workspaceOverrides,
          updatedAt: NOW,
        },
        writerApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
      },
    ]);
  });

  it('should leave compact lists and every other layout alone', () => {
    expect(
      build([
        buildFlatView({
          universalIdentifier: 'compact-list',
          type: ViewType.LIST,
          isCompact: true,
        }),
        buildFlatView({ universalIdentifier: 'inbox', type: ViewType.INBOX }),
        buildFlatView({ universalIdentifier: 'kanban', type: ViewType.KANBAN }),
        buildFlatView({ universalIdentifier: 'table', type: ViewType.TABLE }),
        buildFlatView({
          universalIdentifier: 'standard-list-shown-as-kanban',
          type: ViewType.LIST,
          applicationUniversalIdentifier: STANDARD_APPLICATION,
          overrides: {
            [WORKSPACE_CUSTOM_APPLICATION]: { type: ViewType.KANBAN },
          },
        }),
      ]),
    ).toEqual([]);
  });
});
