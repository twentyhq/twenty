import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useChipFieldDisplay';
import { shouldCompactRecordIndexLabelIdentifierComponentState } from '@/object-record/record-index/states/shouldCompactRecordIndexLabelIdentifierComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { ChipSize } from 'twenty-ui/components';

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

  const shouldCompactRecordIndexLabelIdentifier = useRecoilComponentValue(
    shouldCompactRecordIndexLabelIdentifierComponentState,
  );

  const isLabelIdentifierCompact = shouldCompactRecordIndexLabelIdentifier;

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
