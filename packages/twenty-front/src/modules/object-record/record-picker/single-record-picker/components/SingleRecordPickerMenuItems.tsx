import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { Key } from 'ts-key-enum';

import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

import { RecordPickerInitialLoadingEmptyContainer } from '@/object-record/record-picker/components/RecordPickerInitialLoadingEmptyContainer';
import { RecordPickerLoadingSkeletonList } from '@/object-record/record-picker/components/RecordPickerLoadingSkeletonList';
import { RecordPickerNoRecordFoundMenuItem } from '@/object-record/record-picker/components/RecordPickerNoRecordFoundMenuItem';
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
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { IconComponent } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { singleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowInitialLoadingComponentState';
import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';

export type SingleRecordPickerMenuItemsProps = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  recordsToSelect: SingleRecordPickerRecord[];
  onCancel?: () => void;
  onRecordSelected: (entity?: SingleRecordPickerRecord) => void;
  selectedRecord?: SingleRecordPickerRecord;
  focusId: string;
  filteredSelectedRecords: SingleRecordPickerRecord[];
};

export const SingleRecordPickerMenuItems = ({
  EmptyIcon,
  emptyLabel,
  recordsToSelect,
  onCancel,
  onRecordSelected,
  filteredSelectedRecords,
  selectedRecord,
  focusId,
}: SingleRecordPickerMenuItemsProps) => {
  const recordsInDropdown = [selectedRecord, ...recordsToSelect].filter(
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

  const singleRecordPickerShouldShowSkeleton = useRecoilComponentValueV2(
    singleRecordPickerShouldShowSkeletonComponentState,
  );

  const singleRecordPickerShouldShowInitialLoading = useRecoilComponentValueV2(
    singleRecordPickerShouldShowInitialLoadingComponentState,
  );

  const searchHasNoResults =
    recordsToSelect.length === 0 && filteredSelectedRecords?.length === 0;

  return (
    <SelectableList
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={selectableItemIds}
      hotkeyScope={DropdownHotkeyScope.Dropdown}
      focusId={focusId}
    >
      {emptyLabel && (
        <SelectableListItem
          key={'select-none'}
          itemId={'select-none'}
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
      )}
      {singleRecordPickerShouldShowInitialLoading ? (
        <RecordPickerInitialLoadingEmptyContainer />
      ) : singleRecordPickerShouldShowSkeleton ? (
        <RecordPickerLoadingSkeletonList />
      ) : (
        recordsInDropdown?.map((record) => (
          <SingleRecordPickerMenuItem
            key={record.id}
            record={record}
            onRecordSelected={onRecordSelected}
            selectedRecord={selectedRecord}
          />
        ))
      )}
      {searchHasNoResults && <RecordPickerNoRecordFoundMenuItem />}
    </SelectableList>
  );
};
