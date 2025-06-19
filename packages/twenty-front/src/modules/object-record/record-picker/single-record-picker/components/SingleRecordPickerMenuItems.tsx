import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { Key } from 'ts-key-enum';

import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

import { SingleRecordPickerMenuItem } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
import { IconComponent } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export type SingleRecordPickerMenuItemsProps = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  recordsToSelect: SingleRecordPickerRecord[];
  loading?: boolean;
  onCancel?: () => void;
  onRecordSelected: (entity?: SingleRecordPickerRecord) => void;
  selectedRecord?: SingleRecordPickerRecord;
  focusId: string;
};

export const SingleRecordPickerMenuItems = ({
  EmptyIcon,
  emptyLabel,
  recordsToSelect,
  loading,
  onCancel,
  onRecordSelected,
  selectedRecord,
  focusId,
}: SingleRecordPickerMenuItemsProps) => {
  const selectNone = emptyLabel
    ? {
        __typename: '',
        id: 'select-none',
        name: emptyLabel,
      }
    : null;

  const recordsInDropdown = [
    selectNone,
    selectedRecord,
    ...recordsToSelect,
  ].filter(
    (entity): entity is SingleRecordPickerRecord =>
      isDefined(entity) && isNonEmptyString(entity.name),
  );

  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
    );

  const selectableListComponentInstanceId =
    getSingleRecordPickerSelectableListId(recordPickerComponentInstanceId);

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const isSelectedSelectNoneButton = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    selectableListComponentInstanceId,
    'select-none',
  );

  useHotkeysOnFocusedElement({
    keys: Key.Escape,
    callback: () => {
      resetSelectedItem();
      onCancel?.();
    },
    focusId,
    scope: DropdownHotkeyScope.Dropdown,
    dependencies: [onCancel, resetSelectedItem],
  });

  const selectableItemIds = recordsInDropdown.map((entity) => entity.id);
  const [selectedRecordId, setSelectedRecordId] = useRecoilComponentStateV2(
    singleRecordPickerSelectedIdComponentState,
  );

  return (
    <SelectableList
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={selectableItemIds}
      hotkeyScope={DropdownHotkeyScope.Dropdown}
      focusId={focusId}
    >
      {loading ? (
        <DropdownMenuSkeletonItem />
      ) : (
        recordsInDropdown?.map((record) => {
          switch (record.id) {
            case 'select-none': {
              return (
                emptyLabel && (
                  <SelectableListItem
                    key={record.id}
                    itemId={record.id}
                    onEnter={() => {
                      setSelectedRecordId(undefined);
                      onRecordSelected();
                    }}
                  >
                    <MenuItemSelect
                      onClick={() => {
                        setSelectedRecordId(undefined);
                        onRecordSelected();
                      }}
                      LeftIcon={EmptyIcon}
                      text={emptyLabel}
                      selected={isUndefined(selectedRecordId)}
                      focused={isSelectedSelectNoneButton}
                    />
                  </SelectableListItem>
                )
              );
            }
            default: {
              return (
                <SingleRecordPickerMenuItem
                  key={record.id}
                  record={record}
                  onRecordSelected={onRecordSelected}
                  selectedRecord={selectedRecord}
                />
              );
            }
          }
        })
      )}
    </SelectableList>
  );
};
