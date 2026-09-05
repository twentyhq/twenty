import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { Avatar } from 'twenty-ui/data-display';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type RecordTableWidgetRelationPickerMenuItemProps = {
  relationRecord: SelectableItem;
  onSelect: (relationRecordId: string) => void;
};

export const RecordTableWidgetRelationPickerMenuItem = ({
  relationRecord,
  onSelect,
}: RecordTableWidgetRelationPickerMenuItemProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const scopedDropdownId =
    useWorkspaceSurfaceScopedComponentInstanceId(dropdownId);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    relationRecord.id,
    scopedDropdownId,
  );

  return (
    <SelectableListItem
      itemId={relationRecord.id}
      onEnter={() => onSelect(relationRecord.id)}
    >
      <MenuItemSelectAvatar
        onClick={() => onSelect(relationRecord.id)}
        text={relationRecord.name}
        selected={false}
        focused={isSelectedItemId}
        avatar={
          <Avatar
            avatarUrl={getAbsoluteImageUrl(relationRecord.avatarUrl)}
            placeholderColorSeed={relationRecord.id}
            placeholder={relationRecord.name}
            size="md"
            type={relationRecord.avatarType ?? 'rounded'}
          />
        }
      />
    </SelectableListItem>
  );
};
