import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { RecordIdentifierChip } from '@/object-record/record-index/components/RecordIndexRecordChip';
import { recordIndexOpenRecordInSelector } from '@/object-record/record-index/states/selectors/recordIndexOpenRecordInSelector';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
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

  if (!isDefined(recordValue)) {
    return null;
  }

  switch (recordIndexOpenRecordIn) {
    case ViewOpenRecordInType.RECORD_PAGE: {
      return (
        <RecordIdentifierChip
          objectNameSingular={objectNameSingular}
          record={recordValue}
          size={ChipSize.Small}
          to={labelIdentifierLink}
        />
      );
    }
    case ViewOpenRecordInType.SIDE_PANEL: {
      return (
        <RecordIdentifierChip
          objectNameSingular={objectNameSingular}
          record={recordValue}
          size={ChipSize.Small}
          onClick={() => {
            openRecordInCommandMenu({
              recordId: recordValue.id,
              objectNameSingular,
            });
          }}
        />
      );
    }
    default: {
      return (
        <RecordChip
          objectNameSingular={objectNameSingular}
          record={recordValue}
        />
      );
    }
  }
};
