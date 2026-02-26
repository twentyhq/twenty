import { isUndefined } from '@sniptt/guards';
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
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { type IconComponent } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export type SingleRecordPickerMenuItemsProps = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  pickableMorphItems: RecordPickerPickableMorphItem[];
  onCancel?: () => void;
  onMorphItemSelected: (morphItem?: RecordPickerPickableMorphItem) => void;
  focusId: string;
};

export const SingleRecordPickerMenuItems = ({
  EmptyIcon,
  emptyLabel,
  pickableMorphItems,
  onCancel,
  onMorphItemSelected,
  focusId,
}: SingleRecordPickerMenuItemsProps) => {
  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
    );

  const selectableListComponentInstanceId =
    getSingleRecordPickerSelectableListId(recordPickerComponentInstanceId);

  const { resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
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

  const selectableItemIds = pickableMorphItems.map(
    (morphItem) => morphItem.recordId,
  );
  const [singleRecordPickerSelectedId, setSingleRecordPickerSelectedId] =
    useAtomComponentState(singleRecordPickerSelectedIdComponentState);

  const singleRecordPickerShouldShowSkeleton = useAtomComponentStateValue(
    singleRecordPickerShouldShowSkeletonComponentState,
  );

  const singleRecordPickerShouldShowInitialLoading = useAtomComponentStateValue(
    singleRecordPickerShouldShowInitialLoadingComponentState,
  );

  const itemsMatchingSearchFilter = pickableMorphItems.filter(
    (morphItem) => morphItem.isMatchingSearchFilter,
  );

  const searchHasNoResults = itemsMatchingSearchFilter.length === 0;

  return (
    <SelectableList
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={selectableItemIds}
      focusId={focusId}
    >
      {emptyLabel && (
        <SelectableListItem
          key="select-none"
          itemId="select-none"
          onEnter={() => {
            setSingleRecordPickerSelectedId(undefined);
            onMorphItemSelected();
          }}
        >
          <MenuItemSelect
            onClick={() => {
              setSingleRecordPickerSelectedId(undefined);
              onMorphItemSelected();
            }}
            LeftIcon={EmptyIcon}
            text={emptyLabel}
            selected={isUndefined(singleRecordPickerSelectedId)}
            focused={isSelectedItemId}
          />
        </SelectableListItem>
      )}
      {singleRecordPickerShouldShowInitialLoading ? (
        <RecordPickerInitialLoadingEmptyContainer />
      ) : singleRecordPickerShouldShowSkeleton ? (
        <RecordPickerLoadingSkeletonList />
      ) : (
        itemsMatchingSearchFilter.map((morphItem) => (
          <SingleRecordPickerMenuItem
            key={morphItem.recordId}
            morphItem={morphItem}
            onMorphItemSelected={onMorphItemSelected}
            isRecordSelected={
              singleRecordPickerSelectedId === morphItem.recordId
            }
          />
        ))
      )}
      {searchHasNoResults && <RecordPickerNoRecordFoundMenuItem />}
    </SelectableList>
  );
};
