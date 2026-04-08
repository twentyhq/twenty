import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { shouldInitializeRecordBoardFromUpdateInputs } from '@/object-record/record-board/utils/shouldInitializeRecordBoardFromUpdateInputs';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useGetShouldInitializeRecordBoardForUpdateInputs = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const getShouldInitializeRecordBoardForUpdateInputs = (
    updateInputs: ObjectRecordOperationUpdateInput[],
  ) =>
    shouldInitializeRecordBoardFromUpdateInputs({
      updateInputs,
      activeFieldMetadataItems,
      currentRecordFilters,
      currentRecordSorts,
      recordIndexGroupFieldMetadataItem,
    });

  return {
    getShouldInitializeRecordBoardForUpdateInputs,
  };
};
