import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { RecordIdentifierChip } from '@/object-record/record-index/components/RecordIndexRecordChip';
import { recordIndexOpenRecordInSelector } from '@/object-record/record-index/states/selectors/recordIndexOpenRecordInSelector';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { ChipSize, useIsMobile } from 'twenty-ui';

export const ChipFieldDisplay = () => {
  const {
    recordValue,
    objectNameSingular,
    isLabelIdentifier,
    labelIdentifierLink,
  } = useChipFieldDisplay();

  const recordIndexOpenRecordIn = useRecoilValue(
    recordIndexOpenRecordInSelector,
  );

  const { openRecordInCommandMenu } = useCommandMenu();

  const isMobile = useIsMobile();

  const isRecordTableScrolledLeft = useRecoilComponentValueV2(
    isRecordTableScrolledLeftComponentState,
  );

  const { columnDefinition } = useContext(RecordTableCellContext);

  const isLabelIdentifierInRecordTable = columnDefinition.isLabelIdentifier;

  const isLabelHidden =
    isMobile && !isRecordTableScrolledLeft && isLabelIdentifierInRecordTable;

  if (!recordValue) {
    return null;
  }

  return isLabelIdentifier ? (
    <RecordIdentifierChip
      isLabelHidden={isLabelHidden}
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={
        recordIndexOpenRecordIn === ViewOpenRecordInType.RECORD_PAGE
          ? labelIdentifierLink
          : undefined
      }
      onClick={
        recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
          ? () => {
              openRecordInCommandMenu({
                recordId: recordValue.id,
                objectNameSingular,
              });
            }
          : undefined
      }
    />
  ) : (
    <RecordChip objectNameSingular={objectNameSingular} record={recordValue} />
  );
};
