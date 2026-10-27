import { RecordPickerInitialLoadingEmptyContainer } from '@/object-record/record-picker/components/RecordPickerInitialLoadingEmptyContainer';
import { RecordPickerLoadingSkeletonList } from '@/object-record/record-picker/components/RecordPickerLoadingSkeletonList';
import { MultipleRecordPickerFetchMoreLoader } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerFetchMoreLoader';
import { MultipleRecordPickerMenuItem } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector';
import { upsertMorphItem } from '@/object-record/record-picker/multiple-record-picker/utils/upsertMorphItem';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type MultipleRecordPickerMenuItemsProps = {
  onChange?: (morphItem: RecordPickerPickableMorphItem) => void;
};

export const MultipleRecordPickerMenuItems = ({
  onChange,
}: MultipleRecordPickerMenuItemsProps) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );
  const pickableRecordIds = useAtomComponentSelectorValue(
    multipleRecordPickerPickableRecordIdsMatchingSearchComponentSelector,
    componentInstanceId,
  );
  const [
    multipleRecordPickerPickableMorphItems,
    setMultipleRecordPickerPickableMorphItems,
  ] = useAtomComponentState(
    multipleRecordPickerPickableMorphItemsComponentState,
    componentInstanceId,
  );
  const multipleRecordPickerShouldShowInitialLoading =
    useAtomComponentStateValue(
      multipleRecordPickerShouldShowInitialLoadingComponentState,
    );
  const multipleRecordPickerShouldShowSkeleton = useAtomComponentStateValue(
    multipleRecordPickerShouldShowSkeletonComponentState,
  );
  const selectedRecordIds = multipleRecordPickerPickableMorphItems
    .filter(({ isSelected }) => isSelected)
    .map(({ recordId }) => recordId);

  const handleChange = (morphItem: RecordPickerPickableMorphItem) => {
    setMultipleRecordPickerPickableMorphItems((previousMorphItems) =>
      upsertMorphItem(previousMorphItems, morphItem),
    );
    onChange?.(morphItem);
  };

  return (
    <Dropdown.Section scrollable>
      {multipleRecordPickerShouldShowInitialLoading ? (
        <RecordPickerInitialLoadingEmptyContainer />
      ) : multipleRecordPickerShouldShowSkeleton ? (
        <RecordPickerLoadingSkeletonList />
      ) : !isNonEmptyArray(pickableRecordIds) ? (
        <Dropdown.Empty>{t`No records found`}</Dropdown.Empty>
      ) : (
        <Dropdown.SelectionGroup
          multiple
          value={selectedRecordIds}
          aria-label={t`Records`}
        >
          {pickableRecordIds.map((recordId) => (
            <MultipleRecordPickerMenuItem
              key={recordId}
              recordId={recordId}
              onChange={handleChange}
            />
          ))}
          <MultipleRecordPickerFetchMoreLoader />
        </Dropdown.SelectionGroup>
      )}
    </Dropdown.Section>
  );
};
