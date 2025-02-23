import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useIsChipFieldDisplayLabelHidden } from '@/object-record/record-field/meta-types/display/hooks/useIsChipFieldDisplayLabelHidden';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { RecordIdentifierChip } from '@/object-record/record-index/components/RecordIndexRecordChip';
import { recordIndexOpenRecordInSelector } from '@/object-record/record-index/states/selectors/recordIndexOpenRecordInSelector';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';
import { ChipSize } from 'twenty-ui';

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

  const isChipFieldDisplayLabelHidden = useIsChipFieldDisplayLabelHidden();

  if (!recordValue) {
    return null;
  }

  return isLabelIdentifier ? (
    <RecordIdentifierChip
      isLabelHidden={isChipFieldDisplayLabelHidden}
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
