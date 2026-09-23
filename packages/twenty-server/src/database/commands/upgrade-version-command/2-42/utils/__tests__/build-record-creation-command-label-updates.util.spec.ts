import { buildRecordCreationCommandLabelUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-record-creation-command-label-updates.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-09-23T00:00:00.000Z';

const { universalIdentifier: CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.createNewRecord;

const { universalIdentifier: COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER } =
  STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned;

const FORMER_LABELS = {
  label: 'Create new {objectLabelSingular}',
  shortLabel: 'New {objectLabelSingular}',
};

const CURRENT_LABELS = {
  label: 'Create {objectLabelSingular}',
  shortLabel: 'Create',
};

const buildExistingItems = ({
  label,
  shortLabel,
}: {
  label: string;
  shortLabel: string | null;
}): Record<string, FlatCommandMenuItem> => ({
  [CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER]: {
    universalIdentifier: CREATE_NEW_RECORD_UNIVERSAL_IDENTIFIER,
    label,
    shortLabel,
    updatedAt: '2025-01-01T00:00:00.000Z',
  } as FlatCommandMenuItem,
});

describe('buildRecordCreationCommandLabelUpdates', () => {
  it('renames the former standard labels', () => {
    const updates = buildRecordCreationCommandLabelUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        buildExistingItems(FORMER_LABELS),
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({ ...CURRENT_LABELS, updatedAt: NOW }),
    ]);
  });

  it('renames the former campaign creation labels', () => {
    const updates = buildRecordCreationCommandLabelUpdates({
      flatCommandMenuItemByUniversalIdentifier: {
        [COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: COMPOSE_CAMPAIGN_UNIVERSAL_IDENTIFIER,
          label: 'Create new Campaign',
          shortLabel: 'New Campaign',
          updatedAt: '2025-01-01T00:00:00.000Z',
        } as FlatCommandMenuItem,
      },
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        label: 'Create Campaign',
        shortLabel: 'Create',
        updatedAt: NOW,
      }),
    ]);
  });

  it.each([null, 'Add'])(
    'preserves a hidden or customized short label (%s)',
    (shortLabel) => {
      const updates = buildRecordCreationCommandLabelUpdates({
        flatCommandMenuItemByUniversalIdentifier: buildExistingItems({
          label: FORMER_LABELS.label,
          shortLabel,
        }),
        now: NOW,
      });

      expect(updates).toEqual([
        expect.objectContaining({ label: CURRENT_LABELS.label, shortLabel }),
      ]);
    },
  );

  it('preserves a customized label while renaming the former short label', () => {
    const updates = buildRecordCreationCommandLabelUpdates({
      flatCommandMenuItemByUniversalIdentifier: buildExistingItems({
        label: 'Add a customer',
        shortLabel: FORMER_LABELS.shortLabel,
      }),
      now: NOW,
    });

    expect(updates).toEqual([
      expect.objectContaining({
        label: 'Add a customer',
        shortLabel: CURRENT_LABELS.shortLabel,
      }),
    ]);
  });

  it('returns nothing when the labels are already current', () => {
    expect(
      buildRecordCreationCommandLabelUpdates({
        flatCommandMenuItemByUniversalIdentifier:
          buildExistingItems(CURRENT_LABELS),
        now: NOW,
      }),
    ).toEqual([]);
  });

  it('returns nothing when the standard command is absent', () => {
    expect(
      buildRecordCreationCommandLabelUpdates({
        flatCommandMenuItemByUniversalIdentifier: {},
        now: NOW,
      }),
    ).toEqual([]);
  });
});
