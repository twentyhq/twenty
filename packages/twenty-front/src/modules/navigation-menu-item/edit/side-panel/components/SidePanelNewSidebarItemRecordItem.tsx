import { Avatar, IconFolder, useIcons } from 'twenty-ui/display';

import { useAddRecordToNavigationMenuDraft } from '@/navigation-menu-item/edit/record/hooks/useAddRecordToNavigationMenuDraft';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/common/states/addMenuItemInsertionContextState';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/common/types/add-to-navigation-drag-payload';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  CoreObjectNameSingular,
  NavigationMenuItemType,
} from 'twenty-shared/types';

type SearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type SidePanelNewSidebarItemRecordItemProps = {
  record: SearchRecord;
  dragIndex?: number;
  disableDrag?: boolean;
};

export const SidePanelNewSidebarItemRecordItem = ({
  record,
  dragIndex,
  disableDrag = false,
}: SidePanelNewSidebarItemRecordItemProps) => {
  const { getIcon } = useIcons();
  const { addRecordToDraft } = useAddRecordToNavigationMenuDraft();
  const { currentDraft } = useDraftNavigationMenuItems();
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextState,
  );
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
    const itemId = addRecordToDraft(
      {
        recordId: record.recordId,
        objectNameSingular: record.objectNameSingular,
        label: record.label,
        imageUrl: record.imageUrl,
      },
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId ?? null,
      addMenuItemInsertionContext?.targetIndex,
    );
    setAddMenuItemInsertionContext(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: record.label,
      pageIcon: objectMetadataItem
        ? getIcon(objectMetadataItem.icon)
        : IconFolder,
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
        disableDrag={disableDrag}
        payload={recordPayload}
      />
    </SelectableListItem>
  );
};
