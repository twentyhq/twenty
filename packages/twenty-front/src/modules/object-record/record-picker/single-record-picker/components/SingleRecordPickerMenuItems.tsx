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
import { singleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowInitialLoadingComponentState';
import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { IconComponent } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

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

  const isSelectedSelectNoneButton = useRecoilComponentFamilyValue(
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
    dependencies: [onCancel, resetSelectedItem],
  });

  const selectableItemIds = recordsInDropdown.map((entity) => entity.id);
  const [selectedRecordId, setSelectedRecordId] = useRecoilComponentState(
    singleRecordPickerSelectedIdComponentState,
  );

  const singleRecordPickerShouldShowSkeleton = useRecoilComponentValue(
    singleRecordPickerShouldShowSkeletonComponentState,
  );

  const singleRecordPickerShouldShowInitialLoading = useRecoilComponentValue(
    singleRecordPickerShouldShowInitialLoadingComponentState,
  );

  const searchHasNoResults =
    recordsToSelect.length === 0 && filteredSelectedRecords?.length === 0;

  return (
    <SelectableList
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={selectableItemIds}
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
