import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordFieldLookupFieldContext } from '@/object-record/record-column-lookup/components/RecordFieldLookupFieldContext';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';

type RecordCardLookupInlineCellProps = {
  recordId: string;
  fieldMetadataItem: FieldMetadataItem;
  lookupTarget: RecordFieldLookupTarget;
  fieldInstanceIdPrefix: string;
  anchorId?: string;
  label: string;
};

export const RecordCardLookupInlineCell = ({
  recordId,
  fieldMetadataItem,
  lookupTarget,
  fieldInstanceIdPrefix,
  anchorId,
  label,
}: RecordCardLookupInlineCellProps) => {
  // Two cards can show the same related record, so the cell instance is keyed by the card's record too
  const instanceIdPrefix = `${fieldInstanceIdPrefix}-${recordId}`;

  return (
    <RecordFieldLookupFieldContext
      recordId={recordId}
      fieldMetadataItem={fieldMetadataItem}
      relationObjectMetadataItem={lookupTarget.relationObjectMetadataItem}
      lookupTargetFieldMetadataItem={lookupTarget.lookupTargetFieldMetadataItem}
      instanceIdPrefix={instanceIdPrefix}
      isNonEditable
      label={label}
      fieldContextOverrides={{
        maxWidth: 156,
        isDisplayModeFixHeight: true,
        triggerEvent: 'CLICK',
        anchorId,
        onOpenEditMode: () => undefined,
      }}
    >
      <RecordInlineCell instanceIdPrefix={instanceIdPrefix} />
    </RecordFieldLookupFieldContext>
  );
};
