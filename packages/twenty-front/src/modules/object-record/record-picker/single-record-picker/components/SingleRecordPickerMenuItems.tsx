import { ListItemButton } from 'twenty-ui/components/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { Key } from 'ts-key-enum';

import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

import { RecordPickerInitialLoadingEmptyContainer } from '@/object-record/record-picker/components/RecordPickerInitialLoadingEmptyContainer';
import { RecordPickerLoadingSkeletonList } from '@/object-record/record-picker/components/RecordPickerLoadingSkeletonList';
import { RecordPickerNoRecordFoundMenuItem } from '@/object-record/record-picker/components/RecordPickerNoRecordFoundMenuItem';
import { SingleRecordPickerMenuItem } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
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
import { type IconComponent } from 'twenty-ui/icon';

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
    'select-none',
    selectableListComponentInstanceId,
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

  const singleRecordPickerSearchFilter = useAtomComponentStateValue(
    singleRecordPickerSearchFilterComponentState,
  );

  const isSearchFilterActive = isNonEmptyString(
    singleRecordPickerSearchFilter?.trim(),
  );

  const shouldShowEmptyOption =
    isNonEmptyString(emptyLabel) &&
    (!isSearchFilterActive ||
      emptyLabel
        .toLowerCase()
        .includes(singleRecordPickerSearchFilter.toLowerCase()));

  const itemsMatchingSearchFilter = pickableMorphItems.filter(
    (morphItem) => morphItem.isMatchingSearchFilter,
  );

  const selectableItemIds = [
    ...(shouldShowEmptyOption ? ['select-none'] : []),
    ...itemsMatchingSearchFilter.map((morphItem) => morphItem.recordId),
  ];
  const [singleRecordPickerSelectedId, setSingleRecordPickerSelectedId] =
    useAtomComponentState(singleRecordPickerSelectedIdComponentState);

  const singleRecordPickerShouldShowSkeleton = useAtomComponentStateValue(
    singleRecordPickerShouldShowSkeletonComponentState,
  );

  const singleRecordPickerShouldShowInitialLoading = useAtomComponentStateValue(
    singleRecordPickerShouldShowInitialLoadingComponentState,
  );

  return (
    <SelectableList
      selectableListInstanceId={selectableListComponentInstanceId}
      selectableItemIdArray={selectableItemIds}
      focusId={focusId}
      // When searching, preselect the top matching record so Enter selects it.
      // When not searching and empty option is present, do not preselect to prevent accidental detachment.
      shouldPreselectFirstItem={!shouldShowEmptyOption || isSearchFilterActive}
    >
      {shouldShowEmptyOption && (
        <SelectableListItem
          key="select-none"
          itemId="select-none"
          onEnter={() => {
            setSingleRecordPickerSelectedId(undefined);
            onMorphItemSelected();
          }}
        >
          <ListItemButton
            onClick={() => {
              setSingleRecordPickerSelectedId(undefined);
              onMorphItemSelected();
            }}
            focused={isSelectedItemId}
            role="option"
            aria-selected={isUndefined(singleRecordPickerSelectedId)}
            selected={isUndefined(singleRecordPickerSelectedId)}
            indicator="check"
            startIcon={<SelectOptionIcon Icon={EmptyIcon} />}
          >
            {emptyLabel}
          </ListItemButton>
        </SelectableListItem>
      )}
      {itemsMatchingSearchFilter.length > 0 ? (
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
      ) : singleRecordPickerShouldShowInitialLoading ? (
        <RecordPickerInitialLoadingEmptyContainer />
      ) : singleRecordPickerShouldShowSkeleton ? (
        <RecordPickerLoadingSkeletonList />
      ) : (
        <RecordPickerNoRecordFoundMenuItem />
      )}
    </SelectableList>
  );
};
