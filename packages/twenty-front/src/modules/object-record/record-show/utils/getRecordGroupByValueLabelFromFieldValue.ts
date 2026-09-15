import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getRecordGroupByValueLabelFromFieldValue = ({
  groupByFieldMetadataItem,
  fieldValue,
}: {
  groupByFieldMetadataItem: FieldMetadataItem;
  fieldValue: unknown;
}): string => {
  if (!isDefined(fieldValue) || fieldValue === '') return t`No Value`;

  const selectedOption = groupByFieldMetadataItem.options?.find(
    (option) => option.value === fieldValue,
  );

  return selectedOption?.label ?? t`No Value`;
};
