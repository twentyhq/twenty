import { isDefined } from 'twenty-shared/utils';

import { buildWorkflowCommandSingleSelectionUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-workflow-command-single-selection-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-07T12:00:00.000Z';
const SINGLE_SELECTION_CONDITION = 'numberOfSelectedRecords == 1 and ';
const WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS = [
  '44f19c85-0fd0-482f-a14e-da513c60b1b3',
  '4c227f2e-03bb-4a66-9b13-49f263264f4a',
  'f85d552a-87a3-4667-99f7-71b47917539c',
  'e57efc2d-00a2-493a-b76c-f2dabd23a5eb',
  '92781d24-b875-4282-8cdb-d127f04a5c7d',
];

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-10-06T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const getStandardItem = (universalIdentifier: string): FlatCommandMenuItem => {
  const commandMenuItem =
    allFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
      universalIdentifier
    ];

  if (!isDefined(commandMenuItem)) {
    throw new Error(
      `Standard command menu item ${universalIdentifier} missing`,
    );
  }

  return commandMenuItem;
};

const withPreviousExpressions = () => {
  return Object.fromEntries(
    WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) => {
      const standardItem = getStandardItem(universalIdentifier);

      return [
        universalIdentifier,
        {
          ...standardItem,
          conditionalAvailabilityExpression:
            standardItem.conditionalAvailabilityExpression?.replace(
              SINGLE_SELECTION_CONDITION,
              '',
            ) ?? null,
        },
      ];
    }),
  );
};

describe('buildWorkflowCommandSingleSelectionUpdates', () => {
  it('moves the workflow commands to the current standard expressions', () => {
    const updates = buildWorkflowCommandSingleSelectionUpdates({
      flatCommandMenuItemsByUniversalIdentifier: withPreviousExpressions(),
      now: NOW,
      direction: 'up',
    });

    expect(updates).toHaveLength(WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.length);
    for (const update of updates) {
      expect(update.conditionalAvailabilityExpression).toBe(
        getStandardItem(update.universalIdentifier)
          .conditionalAvailabilityExpression,
      );
      expect(update.updatedAt).toBe(NOW);
    }
  });

  it('leaves customized expressions untouched', () => {
    const items = withPreviousExpressions();
    const [customizedUniversalIdentifier] =
      WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS;
    const customized = items[customizedUniversalIdentifier];

    if (!isDefined(customized)) {
      throw new Error('Expected a workflow command');
    }

    items[customizedUniversalIdentifier] = {
      ...customized,
      conditionalAvailabilityExpression: 'isInSidePanel',
    };

    const updates = buildWorkflowCommandSingleSelectionUpdates({
      flatCommandMenuItemsByUniversalIdentifier: items,
      now: NOW,
      direction: 'up',
    });

    expect(
      updates.map(({ universalIdentifier }) => universalIdentifier),
    ).not.toContain(customizedUniversalIdentifier);
    expect(updates).toHaveLength(
      WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.length - 1,
    );
  });

  it('restores the previous expressions on down', () => {
    const standardItems = Object.fromEntries(
      WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.map((universalIdentifier) => [
        universalIdentifier,
        getStandardItem(universalIdentifier),
      ]),
    );
    const previousItems = withPreviousExpressions();

    const updates = buildWorkflowCommandSingleSelectionUpdates({
      flatCommandMenuItemsByUniversalIdentifier: standardItems,
      now: NOW,
      direction: 'down',
    });

    expect(updates).toHaveLength(WORKFLOW_COMMAND_UNIVERSAL_IDENTIFIERS.length);
    for (const update of updates) {
      expect(update.conditionalAvailabilityExpression).toBe(
        previousItems[update.universalIdentifier]
          ?.conditionalAvailabilityExpression,
      );
    }
  });
});
