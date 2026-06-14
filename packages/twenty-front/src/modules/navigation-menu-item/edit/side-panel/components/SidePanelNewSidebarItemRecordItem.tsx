import { Avatar, useIcons } from 'twenty-ui-deprecated/display';
import {
  CoreObjectNameSingular,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/common/types/add-to-navigation-drag-payload';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type SearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type SidePanelNewSidebarItemRecordItemProps = {
  record: SearchRecord;
  dragIndex?: number;
};

export const SidePanelNewSidebarItemRecordItem = ({
  record,
  dragIndex,
}: SidePanelNewSidebarItemRecordItemProps) => {
  const { getIcon } = useIcons();
  const { createItem } = useNavigationMenuItemEditController();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === record.objectNameSingular,
  );
  const recordPayload: AddToNavigationDragPayload = {
    type: NavigationMenuItemType.RECORD,
    recordId: record.recordId,
    objectMetadataId: objectMetadataItem?.id ?? '',
    objectNameSingular: record.objectNameSingular,
    label: record.label,
    imageUrl: record.imageUrl,
  };

  const handleSelectRecord = () => {
    if (!isDefined(objectMetadataItem)) {
      return;
    }
    const itemId = createItem(
      {
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataId: objectMetadataItem.id,
        targetRecordId: record.recordId,
        targetRecordIdentifier: {
          id: record.recordId,
          labelIdentifier: record.label,
          imageIdentifier: record.imageUrl ?? null,
        },
      },
      {
        targetFolderId: pendingInsertionNavigationMenuItem?.folderId ?? null,
        targetIndex: pendingInsertionNavigationMenuItem?.position,
      },
    );
    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: record.label,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  return (
    <SelectableListItem itemId={record.recordId} onEnter={handleSelectRecord}>
      <SidePanelItemWithAddToNavigationDrag
        customIconContent={
          <Avatar
            type={
              record.objectNameSingular === CoreObjectNameSingular.Company
                ? 'squared'
                : 'rounded'
            }
            avatarUrl={record.imageUrl}
            placeholderColorSeed={record.recordId}
            placeholder={record.label}
          />
        }
        label={record.label}
        description={
          objectMetadataItem?.labelSingular ?? record.objectNameSingular
        }
        id={record.recordId}
        onClick={handleSelectRecord}
        dragIndex={dragIndex}
        payload={recordPayload}
      />
    </SelectableListItem>
  );
};
