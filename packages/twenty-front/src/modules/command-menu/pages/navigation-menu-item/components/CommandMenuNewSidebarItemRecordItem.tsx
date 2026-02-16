import { Avatar } from 'twenty-ui/display';

import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useAddRecordToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddRecordToNavigationMenuDraft';
import { addMenuItemInsertionContextStateV2 } from '@/navigation-menu-item/states/addMenuItemInsertionContextStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type CommandMenuNewSidebarItemRecordItemProps = {
  record: SearchRecord;
  dragIndex?: number;
};

export const CommandMenuNewSidebarItemRecordItem = ({
  record,
  dragIndex,
}: CommandMenuNewSidebarItemRecordItemProps) => {
  const { closeCommandMenu } = useCommandMenu();
  const { addRecordToDraft } = useAddRecordToNavigationMenuDraft();
  const { currentDraft } = useDraftNavigationMenuItems();
  const addMenuItemInsertionContext = useRecoilValueV2(
    addMenuItemInsertionContextStateV2,
  );
  const setAddMenuItemInsertionContext = useSetRecoilStateV2(
    addMenuItemInsertionContextStateV2,
  );
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
    addRecordToDraft(
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
    closeCommandMenu();
  };

  return (
    <SelectableListItem itemId={record.recordId} onEnter={handleSelectRecord}>
      <CommandMenuItemWithAddToNavigationDrag
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
