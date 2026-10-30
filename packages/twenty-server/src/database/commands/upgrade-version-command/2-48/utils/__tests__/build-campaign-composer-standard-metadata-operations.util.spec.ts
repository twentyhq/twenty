import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { buildCampaignComposerStandardMetadataOperations } from 'src/database/commands/upgrade-version-command/2-48/utils/build-campaign-composer-standard-metadata-operations.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

type CampaignComposerWorkspace = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatCommandMenuItemMaps'
>;

type CommandMenuItemPresentation = Pick<
  FlatCommandMenuItem,
  'label' | 'shortLabel' | 'icon'
>;

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const NOW = '2026-10-14T12:00:00.000Z';

const MESSAGE_CAMPAIGN_FIELDS = STANDARD_OBJECTS.messageCampaign.fields;

const MESSAGE_LIST_MEMBER_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageListMember.universalIdentifier;
const EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.emailBlockSettings.universalIdentifier;
const EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.emailPageStyle.universalIdentifier;

const PREVIOUS_COUNT_FIELD_LABELS: Record<string, string> = {
  [MESSAGE_CAMPAIGN_FIELDS.sentCount.universalIdentifier]: 'Sent count',
  [MESSAGE_CAMPAIGN_FIELDS.deliveredCount.universalIdentifier]:
    'Delivered count',
  [MESSAGE_CAMPAIGN_FIELDS.failedCount.universalIdentifier]: 'Failed count',
  [MESSAGE_CAMPAIGN_FIELDS.bouncedCount.universalIdentifier]: 'Bounced count',
  [MESSAGE_CAMPAIGN_FIELDS.complainedCount.universalIdentifier]:
    'Complained count',
  [MESSAGE_CAMPAIGN_FIELDS.skippedCount.universalIdentifier]: 'Skipped count',
};

const BLOCK_SETTINGS_PRESENTATION: CommandMenuItemPresentation = {
  label: 'Block Settings',
  shortLabel: 'Design',
  icon: 'IconAdjustments',
};

const NO_OPERATIONS = {
  flatObjectMetadatasToUpdate: [],
  flatFieldMetadatasToUpdate: [],
  flatCommandMenuItemsToCreate: [],
  flatCommandMenuItemsToDelete: [],
  flatCommandMenuItemsToUpdate: [],
};

const { allFlatEntityMaps: standardFlatEntityMaps } =
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: NOW,
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  });

const CURRENT_WORKSPACE: CampaignComposerWorkspace = {
  flatObjectMetadataMaps: standardFlatEntityMaps.flatObjectMetadataMaps,
  flatFieldMetadataMaps: standardFlatEntityMaps.flatFieldMetadataMaps,
  flatCommandMenuItemMaps: standardFlatEntityMaps.flatCommandMenuItemMaps,
};

const getFlatEntity = <TFlatEntity extends SyncableFlatEntity>(
  flatEntityMaps: FlatEntityMaps<TFlatEntity>,
  universalIdentifier: string,
): TFlatEntity => {
  const flatEntity = flatEntityMaps.byUniversalIdentifier[universalIdentifier];

  if (!isDefined(flatEntity)) {
    throw new Error(`Standard metadata ${universalIdentifier} missing`);
  }

  return flatEntity;
};

const withUpdatedFlatEntities = <TFlatEntity extends SyncableFlatEntity>(
  flatEntityMaps: FlatEntityMaps<TFlatEntity>,
  updateByUniversalIdentifier: Record<string, Partial<TFlatEntity>>,
): FlatEntityMaps<TFlatEntity> => ({
  ...flatEntityMaps,
  byUniversalIdentifier: {
    ...flatEntityMaps.byUniversalIdentifier,
    ...Object.fromEntries(
      Object.entries(updateByUniversalIdentifier).map(
        ([universalIdentifier, update]) => [
          universalIdentifier,
          { ...getFlatEntity(flatEntityMaps, universalIdentifier), ...update },
        ],
      ),
    ),
  },
});

const buildPreviousWorkspace = ({
  countFieldLabels = PREVIOUS_COUNT_FIELD_LABELS,
  emailBlockSettingsPresentation = BLOCK_SETTINGS_PRESENTATION,
}: {
  countFieldLabels?: Record<string, string>;
  emailBlockSettingsPresentation?: CommandMenuItemPresentation;
} = {}): CampaignComposerWorkspace => {
  const flatCommandMenuItemMaps = withUpdatedFlatEntities(
    CURRENT_WORKSPACE.flatCommandMenuItemMaps,
    {
      [EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER]:
        emailBlockSettingsPresentation,
    },
  );

  return {
    flatObjectMetadataMaps: withUpdatedFlatEntities(
      CURRENT_WORKSPACE.flatObjectMetadataMaps,
      { [MESSAGE_LIST_MEMBER_UNIVERSAL_IDENTIFIER]: { isUICreatable: true } },
    ),
    flatFieldMetadataMaps: withUpdatedFlatEntities(
      CURRENT_WORKSPACE.flatFieldMetadataMaps,
      Object.fromEntries(
        Object.entries(countFieldLabels).map(([universalIdentifier, label]) => [
          universalIdentifier,
          { label },
        ]),
      ),
    ),
    flatCommandMenuItemMaps: {
      ...flatCommandMenuItemMaps,
      byUniversalIdentifier: {
        ...flatCommandMenuItemMaps.byUniversalIdentifier,
        [EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER]: undefined,
      },
    },
  };
};

const syncWorkspace = (
  workspace: CampaignComposerWorkspace,
  direction: 'up' | 'down',
) =>
  buildCampaignComposerStandardMetadataOperations({
    ...workspace,
    workspaceId: WORKSPACE_ID,
    direction,
    now: NOW,
  });

const getLabelByUniversalIdentifier = (
  flatFieldMetadatas: FlatFieldMetadata[],
): Record<string, string> =>
  Object.fromEntries(
    flatFieldMetadatas.map(({ universalIdentifier, label }) => [
      universalIdentifier,
      label,
    ]),
  );

const CURRENT_COUNT_FIELD_LABELS = getLabelByUniversalIdentifier(
  Object.keys(PREVIOUS_COUNT_FIELD_LABELS).map((universalIdentifier) =>
    getFlatEntity(CURRENT_WORKSPACE.flatFieldMetadataMaps, universalIdentifier),
  ),
);

const currentEmailBlockSettings = getFlatEntity(
  CURRENT_WORKSPACE.flatCommandMenuItemMaps,
  EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER,
);

const CURRENT_EMAIL_BLOCK_SETTINGS_PRESENTATION: CommandMenuItemPresentation = {
  label: currentEmailBlockSettings.label,
  shortLabel: currentEmailBlockSettings.shortLabel,
  icon: currentEmailBlockSettings.icon,
};

describe('buildCampaignComposerStandardMetadataOperations', () => {
  it('moves a workspace on the previous campaign defaults to the current standard metadata', () => {
    const operations = syncWorkspace(buildPreviousWorkspace(), 'up');

    expect(
      getLabelByUniversalIdentifier(operations.flatFieldMetadatasToUpdate),
    ).toEqual(CURRENT_COUNT_FIELD_LABELS);
    expect(operations.flatCommandMenuItemsToCreate).toMatchObject([
      { universalIdentifier: EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER },
    ]);
    expect(operations.flatCommandMenuItemsToDelete).toEqual([]);
    expect(operations.flatCommandMenuItemsToUpdate).toMatchObject([
      {
        universalIdentifier: EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER,
        ...CURRENT_EMAIL_BLOCK_SETTINGS_PRESENTATION,
      },
    ]);
    expect(operations.flatObjectMetadatasToUpdate).toMatchObject([
      {
        universalIdentifier: MESSAGE_LIST_MEMBER_UNIVERSAL_IDENTIFIER,
        isUICreatable: false,
      },
    ]);
  });

  it('changes nothing on a workspace already on the current standard metadata', () => {
    expect(syncWorkspace(CURRENT_WORKSPACE, 'up')).toEqual(NO_OPERATIONS);
  });

  it('keeps a campaign count label someone changed', () => {
    const customizedFieldUniversalIdentifier =
      MESSAGE_CAMPAIGN_FIELDS.deliveredCount.universalIdentifier;

    const operations = syncWorkspace(
      buildPreviousWorkspace({
        countFieldLabels: {
          ...PREVIOUS_COUNT_FIELD_LABELS,
          [customizedFieldUniversalIdentifier]: 'Delivered emails',
        },
      }),
      'up',
    );

    const {
      [customizedFieldUniversalIdentifier]: _customizedFieldLabel,
      ...otherCountFieldLabels
    } = CURRENT_COUNT_FIELD_LABELS;

    expect(
      getLabelByUniversalIdentifier(operations.flatFieldMetadatasToUpdate),
    ).toEqual(otherCountFieldLabels);
  });

  it.each<{ customization: Partial<CommandMenuItemPresentation> }>([
    { customization: { label: 'Edit blocks' } },
    { customization: { shortLabel: null } },
    { customization: { icon: 'IconLayoutGrid' } },
  ])(
    'keeps the customized Block Settings $customization',
    ({ customization }) => {
      const operations = syncWorkspace(
        buildPreviousWorkspace({
          emailBlockSettingsPresentation: {
            ...BLOCK_SETTINGS_PRESENTATION,
            ...customization,
          },
        }),
        'up',
      );

      expect(operations.flatCommandMenuItemsToUpdate).toMatchObject([
        { ...CURRENT_EMAIL_BLOCK_SETTINGS_PRESENTATION, ...customization },
      ]);
    },
  );

  it('restores the previous campaign defaults on down', () => {
    const operations = syncWorkspace(CURRENT_WORKSPACE, 'down');

    expect(
      getLabelByUniversalIdentifier(operations.flatFieldMetadatasToUpdate),
    ).toEqual(PREVIOUS_COUNT_FIELD_LABELS);
    expect(operations.flatCommandMenuItemsToCreate).toEqual([]);
    expect(operations.flatCommandMenuItemsToDelete).toMatchObject([
      { universalIdentifier: EMAIL_PAGE_STYLE_UNIVERSAL_IDENTIFIER },
    ]);
    expect(operations.flatCommandMenuItemsToUpdate).toMatchObject([
      {
        universalIdentifier: EMAIL_BLOCK_SETTINGS_UNIVERSAL_IDENTIFIER,
        ...BLOCK_SETTINGS_PRESENTATION,
      },
    ]);
    expect(operations.flatObjectMetadatasToUpdate).toMatchObject([
      {
        universalIdentifier: MESSAGE_LIST_MEMBER_UNIVERSAL_IDENTIFIER,
        isUICreatable: true,
      },
    ]);
  });

  it('changes nothing on down for a workspace already on the previous campaign defaults', () => {
    expect(syncWorkspace(buildPreviousWorkspace(), 'down')).toEqual(
      NO_OPERATIONS,
    );
  });

  it('changes nothing on a workspace without the campaign standard metadata', () => {
    expect(
      syncWorkspace(
        {
          flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
          flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
          flatCommandMenuItemMaps: createEmptyFlatEntityMaps(),
        },
        'up',
      ),
    ).toEqual(NO_OPERATIONS);
  });
});
