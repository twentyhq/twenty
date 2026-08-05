import { getEstimatedRecordBoardCardHeight } from '@/object-record/record-board/utils/getEstimatedRecordBoardCardHeight';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const useEstimatedRecordBoardCardHeight = () => {
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const numberOfVisibleBodyFields = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  ).length;

  return getEstimatedRecordBoardCardHeight({
    numberOfVisibleBodyFields,
    isCompactModeActive,
  });
};
