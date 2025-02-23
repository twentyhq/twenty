import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useContext } from 'react';
import { useIsMobile } from 'twenty-ui';

export const useIsChipFieldDisplayLabelHidden = () => {
  const isMobile = useIsMobile();

  const isRecordTableScrolledLeft = useRecoilComponentValueV2(
    isRecordTableScrolledLeftComponentState,
  );

  const { columnDefinition } = useContext(RecordTableCellContext);

  const isLabelIdentifierInRecordTable = columnDefinition?.isLabelIdentifier;

  const isLabelHidden =
    isMobile && !isRecordTableScrolledLeft && isLabelIdentifierInRecordTable;

  return isLabelHidden;
};
