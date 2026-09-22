import { buildGateWorkflowFavoriteCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-gate-workflow-favorite-command-menu-item-updates.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const NOW = '2026-09-22T00:00:00.000Z';
const GATED_ADD_EXPRESSION = 'gated add expression';
const GATED_REMOVE_EXPRESSION = 'gated remove expression';

const EXPRESSION_BY_ENGINE_COMPONENT_KEY = {
  [EngineComponentKey.ADD_TO_FAVORITES]: GATED_ADD_EXPRESSION,
  [EngineComponentKey.REMOVE_FROM_FAVORITES]: GATED_REMOVE_EXPRESSION,
};

const buildFlatCommandMenuItem = (
  overrides: Partial<FlatCommandMenuItem>,
): FlatCommandMenuItem =>
  ({
    id: 'command-menu-item-id',
    engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
    conditionalAvailabilityExpression: 'legacy expression',
    isPinned: true,
    position: 7,
    ...overrides,
  }) as FlatCommandMenuItem;

describe('buildGateWorkflowFavoriteCommandMenuItemUpdates', () => {
  it('rewrites both favorite commands to the gated expressions', () => {
    const updates = buildGateWorkflowFavoriteCommandMenuItemUpdates({
      flatCommandMenuItems: [
        buildFlatCommandMenuItem({ id: 'add' }),
        buildFlatCommandMenuItem({
          id: 'remove',
          engineComponentKey: EngineComponentKey.REMOVE_FROM_FAVORITES,
        }),
      ],
      conditionalAvailabilityExpressionByEngineComponentKey:
        EXPRESSION_BY_ENGINE_COMPONENT_KEY,
      now: NOW,
    });

    expect(
      updates.map(({ id, conditionalAvailabilityExpression }) => ({
        id,
        conditionalAvailabilityExpression,
      })),
    ).toEqual([
      { id: 'add', conditionalAvailabilityExpression: GATED_ADD_EXPRESSION },
      {
        id: 'remove',
        conditionalAvailabilityExpression: GATED_REMOVE_EXPRESSION,
      },
    ]);
  });

  it('preserves every unrelated command menu item field', () => {
    const [update] = buildGateWorkflowFavoriteCommandMenuItemUpdates({
      flatCommandMenuItems: [buildFlatCommandMenuItem({})],
      conditionalAvailabilityExpressionByEngineComponentKey:
        EXPRESSION_BY_ENGINE_COMPONENT_KEY,
      now: NOW,
    });

    expect(update).toMatchObject({
      id: 'command-menu-item-id',
      isPinned: true,
      position: 7,
      updatedAt: NOW,
    });
  });

  it('leaves other command menu items untouched', () => {
    expect(
      buildGateWorkflowFavoriteCommandMenuItemUpdates({
        flatCommandMenuItems: [
          buildFlatCommandMenuItem({
            engineComponentKey: EngineComponentKey.NAVIGATION,
          }),
          undefined,
        ],
        conditionalAvailabilityExpressionByEngineComponentKey:
          EXPRESSION_BY_ENGINE_COMPONENT_KEY,
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('is idempotent once the gated expression is already stored', () => {
    expect(
      buildGateWorkflowFavoriteCommandMenuItemUpdates({
        flatCommandMenuItems: [
          buildFlatCommandMenuItem({
            conditionalAvailabilityExpression: GATED_ADD_EXPRESSION,
          }),
        ],
        conditionalAvailabilityExpressionByEngineComponentKey:
          EXPRESSION_BY_ENGINE_COMPONENT_KEY,
        now: NOW,
      }),
    ).toEqual([]);
  });
});
