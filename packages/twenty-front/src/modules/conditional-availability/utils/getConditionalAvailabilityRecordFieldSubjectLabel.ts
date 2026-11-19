import { getConditionalAvailabilityRecordFieldSubFieldLabel } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubFieldLabel';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getConditionalAvailabilityRecordFieldSubjectLabel = ({
  field,
  subFieldName,
}: {
  field: Pick<FieldMetadataItem, 'type' | 'label'>;
  subFieldName: string | null;
}): string => {
  const fieldLabel = field.label;
  const subFieldLabel = getConditionalAvailabilityRecordFieldSubFieldLabel({
    field,
    subFieldName,
  });

  return isDefined(subFieldLabel)
    ? t`${fieldLabel} · ${subFieldLabel}`
    : fieldLabel;
};
