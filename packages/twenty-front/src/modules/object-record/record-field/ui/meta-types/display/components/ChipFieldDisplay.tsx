import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useChipFieldDisplay';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { ChipSize } from 'twenty-ui/components';
import { useIsMobile } from 'twenty-ui/utilities';

export const ChipFieldDisplay = () => {
  const {
    recordValue,
    objectNameSingular,
    labelIdentifierLink,
    disableChipClick,
    maxWidth,
    triggerEvent,
    onRecordChipClick,
  } = useChipFieldDisplay();

  const isMobile = useIsMobile();
  const isRecordTableScrolledLeftComponent = useRecoilComponentValue(
    isRecordTableScrolledLeftComponentState,
  );

  const isLabelIdentifierCompact =
    isMobile && !isRecordTableScrolledLeftComponent;

  if (!isDefined(recordValue)) {
    return null;
  }

  return (
    <RecordChip
      maxWidth={maxWidth}
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={labelIdentifierLink}
      isLabelHidden={isLabelIdentifierCompact}
      forceDisableClick={disableChipClick}
      triggerEvent={triggerEvent}
      onClick={onRecordChipClick}
    />
  );
};
