import { isNonEmptyString } from '@sniptt/guards';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { COMMAND_MENU_SECTION_PREVIEW_ITEM_COUNT } from '@/command-menu-item/constants/CommandMenuSectionPreviewItemCount';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type PreviewedCommandMenuItem = {
  label: string;
  creationTargetObjectMetadataId?: Nullable<string>;
  navigationTargetObjectMetadataId?: Nullable<string>;
};

type PreviewObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'labelSingular' | 'labelPlural'
>;

const removeSectionHeadingPrefix = ({
  label,
  sectionHeading,
}: {
  label: string;
  sectionHeading: string;
}) => {
  const prefix = `${sectionHeading} `;

  if (!label.toLowerCase().startsWith(prefix.toLowerCase())) {
    return label;
  }

  const labelWithoutPrefix = label.slice(prefix.length);

  return isNonEmptyString(labelWithoutPrefix.trim())
    ? labelWithoutPrefix
    : label;
};

const getPreviewLabel = ({
  section,
  sectionHeading,
  commandMenuItem,
  objectMetadataItems,
}: {
  section: CommandMenuItemSection;
  sectionHeading: string;
  commandMenuItem: PreviewedCommandMenuItem;
  objectMetadataItems: PreviewObjectMetadataItem[];
}) => {
  const labelWithoutHeading = removeSectionHeadingPrefix({
    label: commandMenuItem.label,
    sectionHeading,
  });

  const findObjectMetadataItem = (objectMetadataId: Nullable<string>) =>
    isDefined(objectMetadataId)
      ? objectMetadataItems.find(
          (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
        )
      : undefined;

  if (section === 'CREATE_RECORD') {
    return (
      findObjectMetadataItem(commandMenuItem.creationTargetObjectMetadataId)
        ?.labelSingular ?? labelWithoutHeading
    );
  }

  if (section === 'GO_TO') {
    return (
      findObjectMetadataItem(commandMenuItem.navigationTargetObjectMetadataId)
        ?.labelPlural ?? labelWithoutHeading
    );
  }

  return labelWithoutHeading;
};

export const getCommandMenuItemSectionPreview = ({
  section,
  sectionHeading,
  commandMenuItems,
  objectMetadataItems,
}: {
  section: CommandMenuItemSection;
  sectionHeading: string;
  commandMenuItems: PreviewedCommandMenuItem[];
  objectMetadataItems: PreviewObjectMetadataItem[];
}): string => {
  const previewLabels = commandMenuItems
    .slice(0, COMMAND_MENU_SECTION_PREVIEW_ITEM_COUNT)
    .map((commandMenuItem) =>
      getPreviewLabel({
        section,
        sectionHeading,
        commandMenuItem,
        objectMetadataItems,
      }),
    );

  const hasMoreItems =
    commandMenuItems.length > COMMAND_MENU_SECTION_PREVIEW_ITEM_COUNT;

  return `${previewLabels.join(', ')}${hasMoreItems ? '…' : ''}`;
};
