import {
  buildTestWorkflowAvailabilityUpdate,
  LEGACY_TEST_WORKFLOW_AVAILABILITY_EXPRESSION,
} from 'src/database/commands/upgrade-version-command/2-41/utils/build-test-workflow-availability-update.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-01-01T00:00:00.000Z';

const { universalIdentifier, conditionalAvailabilityExpression } =
  STANDARD_COMMAND_MENU_ITEMS.testWorkflow;

const buildExistingItem = (existingExpression: string): FlatCommandMenuItem =>
  ({
    universalIdentifier,
    conditionalAvailabilityExpression: existingExpression,
    updatedAt: '2025-01-01T00:00:00.000Z',
  }) as FlatCommandMenuItem;

describe('buildTestWorkflowAvailabilityUpdate', () => {
  it('widens the legacy expression to database event triggers', () => {
    expect(
      buildTestWorkflowAvailabilityUpdate({
        flatCommandMenuItemByUniversalIdentifier: {
          [universalIdentifier]: buildExistingItem(
            LEGACY_TEST_WORKFLOW_AVAILABILITY_EXPRESSION,
          ),
        },
        now: NOW,
      }),
    ).toEqual([
      expect.objectContaining({
        universalIdentifier,
        conditionalAvailabilityExpression,
        updatedAt: NOW,
      }),
    ]);
  });

  it('leaves a workspace that customized its own expression alone', () => {
    expect(
      buildTestWorkflowAvailabilityUpdate({
        flatCommandMenuItemByUniversalIdentifier: {
          [universalIdentifier]: buildExistingItem(
            'numberOfSelectedRecords == 1',
          ),
        },
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('is a no-op once the workspace already carries the new expression', () => {
    expect(
      buildTestWorkflowAvailabilityUpdate({
        flatCommandMenuItemByUniversalIdentifier: {
          [universalIdentifier]: buildExistingItem(
            conditionalAvailabilityExpression,
          ),
        },
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('skips a workspace that does not have the command', () => {
    expect(
      buildTestWorkflowAvailabilityUpdate({
        flatCommandMenuItemByUniversalIdentifier: {},
        now: NOW,
      }),
    ).toEqual([]);
  });
});
