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

const getPreviewLabel = ({
  section,
  commandMenuItem,
  objectMetadataItems,
}: {
  section: CommandMenuItemSection;
  commandMenuItem: PreviewedCommandMenuItem;
  objectMetadataItems: PreviewObjectMetadataItem[];
}) => {
  const findObjectMetadataItem = (objectMetadataId: Nullable<string>) =>
    isDefined(objectMetadataId)
      ? objectMetadataItems.find(
          (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
        )
      : undefined;

  if (section === 'CREATE_RECORD') {
    return (
      findObjectMetadataItem(commandMenuItem.creationTargetObjectMetadataId)
        ?.labelSingular ?? commandMenuItem.label
    );
  }

  if (section === 'GO_TO') {
    return (
      findObjectMetadataItem(commandMenuItem.navigationTargetObjectMetadataId)
        ?.labelPlural ?? commandMenuItem.label
    );
  }

  return commandMenuItem.label;
};

export const getCommandMenuItemSectionPreview = ({
  section,
  commandMenuItems,
  objectMetadataItems,
}: {
  section: CommandMenuItemSection;
  commandMenuItems: PreviewedCommandMenuItem[];
  objectMetadataItems: PreviewObjectMetadataItem[];
}): string => {
  const previewLabels = commandMenuItems
    .slice(0, COMMAND_MENU_SECTION_PREVIEW_ITEM_COUNT)
    .map((commandMenuItem) =>
      getPreviewLabel({ section, commandMenuItem, objectMetadataItems }),
    );

  const hasMoreItems =
    commandMenuItems.length > COMMAND_MENU_SECTION_PREVIEW_ITEM_COUNT;

  return `${previewLabels.join(', ')}${hasMoreItems ? '…' : ''}`;
};
