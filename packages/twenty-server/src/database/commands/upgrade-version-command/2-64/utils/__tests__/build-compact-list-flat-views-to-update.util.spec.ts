import { ViewType } from 'twenty-shared/types';

import { buildCompactListFlatViewsToUpdate } from 'src/database/commands/upgrade-version-command/2-64/utils/build-compact-list-flat-views-to-update.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';
const STANDARD_APPLICATION = 'standard-application';
const NOW = '2026-11-25T00:00:00.000Z';

type FlatViewFixture = Parameters<
  typeof buildCompactListFlatViewsToUpdate
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
  buildCompactListFlatViewsToUpdate({
    flatViews,
    fieldMetadataUniversalIdentifierById: {},
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    now: NOW,
  });

describe('buildCompactListFlatViewsToUpdate', () => {
  it('should set the column on list views the workspace owns', () => {
    expect(
      build([
        buildFlatView({ universalIdentifier: 'list', type: ViewType.LIST }),
        buildFlatView({
          universalIdentifier: 'list-widget',
          type: ViewType.LIST_WIDGET,
        }),
      ]),
    ).toEqual([
      buildFlatView({
        universalIdentifier: 'list',
        type: ViewType.LIST,
        isCompact: true,
        updatedAt: NOW,
      }),
      buildFlatView({
        universalIdentifier: 'list-widget',
        type: ViewType.LIST_WIDGET,
        isCompact: true,
        updatedAt: NOW,
      }),
    ]);
  });

  it('should override Compact view on a standard view the workspace turned into a list', () => {
    const workspaceOverrides = {
      [WORKSPACE_CUSTOM_APPLICATION]: { type: ViewType.LIST, isCompact: true },
    };

    expect(
      build([
        buildFlatView({
          universalIdentifier: 'standard-table-shown-as-list',
          type: ViewType.TABLE,
          applicationUniversalIdentifier: STANDARD_APPLICATION,
          overrides: {
            [WORKSPACE_CUSTOM_APPLICATION]: { type: ViewType.LIST },
          },
        }),
      ]),
    ).toEqual([
      buildFlatView({
        universalIdentifier: 'standard-table-shown-as-list',
        type: ViewType.TABLE,
        applicationUniversalIdentifier: STANDARD_APPLICATION,
        overrides: workspaceOverrides,
        universalOverrides: workspaceOverrides,
        updatedAt: NOW,
      }),
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
