import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME } from '@/object-record/record-list/constants/RecordListRowFieldAnchorClassName';
import { recordListHoveredFieldLabelComponentState } from '@/object-record/record-list/states/recordListHoveredFieldLabelComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';

export const RecordListFieldTooltip = () => {
  const recordListHoveredFieldLabel = useAtomComponentStateValue(
    recordListHoveredFieldLabelComponentState,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleRecordFieldIds = visibleRecordFields
    .map((recordField) => recordField.fieldMetadataItemId)
    .join('-');

  return (
    <AppTooltip
      key={visibleRecordFieldIds}
      anchorSelect={`.${RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME}`}
      content={recordListHoveredFieldLabel}
      noArrow
      place="bottom"
      positionStrategy="fixed"
      delay={TooltipDelay.shortDelay}
    />
  );
};
