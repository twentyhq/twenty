import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME } from '@/object-record/record-list/constants/RecordListRowFieldAnchorClassName';
import { recordListHoveredFieldMetadataItemIdComponentState } from '@/object-record/record-list/states/recordListHoveredFieldMetadataItemIdComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';

export const RecordListFieldTooltip = () => {
  const { getIcon } = useIcons();

  const { fieldDefinitionByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const recordListHoveredFieldMetadataItemId = useAtomComponentStateValue(
    recordListHoveredFieldMetadataItemIdComponentState,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleRecordFieldIds = visibleRecordFields
    .map((recordField) => recordField.fieldMetadataItemId)
    .join('-');

  const hoveredFieldDefinition = isDefined(recordListHoveredFieldMetadataItemId)
    ? fieldDefinitionByFieldMetadataItemId[recordListHoveredFieldMetadataItemId]
    : undefined;

  const FieldIcon = isDefined(hoveredFieldDefinition)
    ? getIcon(hoveredFieldDefinition.iconName)
    : null;

  return (
    <AppTooltip
      key={visibleRecordFieldIds}
      anchorSelect={`.${RECORD_LIST_ROW_FIELD_ANCHOR_CLASS_NAME}`}
      title={hoveredFieldDefinition?.label}
      Icon={FieldIcon ?? undefined}
      noArrow
      place="bottom"
      positionStrategy="fixed"
      delay={TooltipDelay.shortDelay}
    />
  );
};
