import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getRecordGroupByValueLabelFromFieldValue = ({
  groupByFieldMetadataItem,
  fieldValue,
}: {
  groupByFieldMetadataItem: FieldMetadataItem;
  fieldValue: unknown;
}): string => {
  if (!isDefined(fieldValue) || fieldValue === '') return t`No Value`;

  if (groupByFieldMetadataItem.type === FieldMetadataType.SELECT) {
    const selectedOption = groupByFieldMetadataItem.options?.find(
      (option) => option.value === fieldValue,
    );
    return selectedOption?.label ?? t`No Value`;
  }

  return t`No Value`;
};
