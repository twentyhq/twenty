import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

export type CampaignComposerStandardMetadataOperations = {
  flatObjectMetadatasToUpdate: FlatObjectMetadata[];
  flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  flatCommandMenuItemsToCreate: FlatCommandMenuItem[];
  flatCommandMenuItemsToDelete: FlatCommandMenuItem[];
  flatCommandMenuItemsToUpdate: FlatCommandMenuItem[];
};

type BuildCampaignComposerStandardMetadataOperationsArgs = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatCommandMenuItemMaps'
> & {
  workspaceId: string;
  direction: 'up' | 'down';
  now: string;
};

type CommandMenuItemPresentation = Pick<
  FlatCommandMenuItem,
  'label' | 'shortLabel' | 'icon'
>;

const MESSAGE_CAMPAIGN_FIELDS = STANDARD_OBJECTS.messageCampaign.fields;

const COUNT_FIELD_LABELS = [
  {
    universalIdentifier: MESSAGE_CAMPAIGN_FIELDS.sentCount.universalIdentifier,
    countLabel: 'Sent count',
    label: 'Sent',
  },
  {
    universalIdentifier:
      MESSAGE_CAMPAIGN_FIELDS.deliveredCount.universalIdentifier,
    countLabel: 'Delivered count',
    label: 'Delivered',
  },
  {
    universalIdentifier:
      MESSAGE_CAMPAIGN_FIELDS.failedCount.universalIdentifier,
    countLabel: 'Failed count',
    label: 'Failed',
  },
  {
    universalIdentifier:
      MESSAGE_CAMPAIGN_FIELDS.bouncedCount.universalIdentifier,
    countLabel: 'Bounced count',
    label: 'Bounced',
  },
  {
    universalIdentifier:
      MESSAGE_CAMPAIGN_FIELDS.complainedCount.universalIdentifier,
    countLabel: 'Complained count',
    label: 'Complaints',
  },
  {
    universalIdentifier:
      MESSAGE_CAMPAIGN_FIELDS.skippedCount.universalIdentifier,
    countLabel: 'Skipped count',
    label: 'Skipped',
  },
];

const BLOCK_SETTINGS_PRESENTATION: CommandMenuItemPresentation = {
  label: 'Block Settings',
  shortLabel: 'Design',
  icon: 'IconAdjustments',
};

const ADD_BLOCK_PRESENTATION: CommandMenuItemPresentation = {
  label: 'Add Block',
  shortLabel: 'Add Block',
  icon: 'IconPlus',
};

const buildCountFieldLabelUpdates = ({
  flatFieldMetadataMaps,
  direction,
  now,
}: Pick<
  BuildCampaignComposerStandardMetadataOperationsArgs,
  'flatFieldMetadataMaps' | 'direction' | 'now'
>): FlatFieldMetadata[] =>
  COUNT_FIELD_LABELS.flatMap(({ universalIdentifier, countLabel, label }) => {
    const flatFieldMetadata =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier,
      });

    const [previousLabel, nextLabel] =
      direction === 'up' ? [countLabel, label] : [label, countLabel];

    if (
      !isDefined(flatFieldMetadata) ||
      flatFieldMetadata.label !== previousLabel
    ) {
      return [];
    }

    return [{ ...flatFieldMetadata, label: nextLabel, updatedAt: now }];
  });

const buildEmailBlockSettingsPresentationUpdates = ({
  flatCommandMenuItemMaps,
  direction,
  now,
}: Pick<
  BuildCampaignComposerStandardMetadataOperationsArgs,
  'flatCommandMenuItemMaps' | 'direction' | 'now'
>): FlatCommandMenuItem[] => {
  const emailBlockSettings =
    findFlatEntityByUniversalIdentifier<FlatCommandMenuItem>({
      flatEntityMaps: flatCommandMenuItemMaps,
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.emailBlockSettings.universalIdentifier,
    });

  if (!isDefined(emailBlockSettings)) {
    return [];
  }

  const [previousPresentation, nextPresentation] =
    direction === 'up'
      ? [BLOCK_SETTINGS_PRESENTATION, ADD_BLOCK_PRESENTATION]
      : [ADD_BLOCK_PRESENTATION, BLOCK_SETTINGS_PRESENTATION];

  const shouldUpdateLabel =
    emailBlockSettings.label === previousPresentation.label;
  const shouldUpdateShortLabel =
    emailBlockSettings.shortLabel === previousPresentation.shortLabel;
  const shouldUpdateIcon =
    emailBlockSettings.icon === previousPresentation.icon;

  if (!shouldUpdateLabel && !shouldUpdateShortLabel && !shouldUpdateIcon) {
    return [];
  }

  return [
    {
      ...emailBlockSettings,
      label: shouldUpdateLabel
        ? nextPresentation.label
        : emailBlockSettings.label,
      shortLabel: shouldUpdateShortLabel
        ? nextPresentation.shortLabel
        : emailBlockSettings.shortLabel,
      icon: shouldUpdateIcon ? nextPresentation.icon : emailBlockSettings.icon,
      updatedAt: now,
    },
  ];
};

const buildMessageListMemberUpdates = ({
  flatObjectMetadataMaps,
  direction,
  now,
}: Pick<
  BuildCampaignComposerStandardMetadataOperationsArgs,
  'flatObjectMetadataMaps' | 'direction' | 'now'
>): FlatObjectMetadata[] => {
  const messageListMember =
    findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.messageListMember.universalIdentifier,
    });

  const isUICreatable = direction === 'down';

  if (
    !isDefined(messageListMember) ||
    messageListMember.isUICreatable === isUICreatable
  ) {
    return [];
  }

  return [{ ...messageListMember, isUICreatable, updatedAt: now }];
};

export const buildCampaignComposerStandardMetadataOperations = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatCommandMenuItemMaps,
  workspaceId,
  direction,
  now,
}: BuildCampaignComposerStandardMetadataOperationsArgs): CampaignComposerStandardMetadataOperations => {
  const emailPageStyle =
    findFlatEntityByUniversalIdentifier<FlatCommandMenuItem>({
      flatEntityMaps: flatCommandMenuItemMaps,
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.emailPageStyle.universalIdentifier,
    });

  return {
    flatObjectMetadatasToUpdate: buildMessageListMemberUpdates({
      flatObjectMetadataMaps,
      direction,
      now,
    }),
    flatFieldMetadatasToUpdate: buildCountFieldLabelUpdates({
      flatFieldMetadataMaps,
      direction,
      now,
    }),
    flatCommandMenuItemsToCreate:
      direction === 'up'
        ? buildMissingStandardCommandMenuItemsToCreate({
            commandMenuItemNames: ['emailPageStyle'],
            flatCommandMenuItemByUniversalIdentifier:
              flatCommandMenuItemMaps.byUniversalIdentifier,
            flatObjectMetadataMaps,
            workspaceId,
            now,
          })
        : [],
    flatCommandMenuItemsToDelete:
      direction === 'down' && isDefined(emailPageStyle) ? [emailPageStyle] : [],
    flatCommandMenuItemsToUpdate: buildEmailBlockSettingsPresentationUpdates({
      flatCommandMenuItemMaps,
      direction,
      now,
    }),
  };
};
