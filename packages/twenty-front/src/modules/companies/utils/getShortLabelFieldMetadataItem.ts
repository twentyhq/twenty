import { COMPANY_SHORT_NAME_FIELD_NAME } from '@/companies/constants/CompanyShortNameFieldName';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const getShortLabelFieldMetadataItem = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'nameSingular'
  >,
): FieldMetadataItem | undefined => {
  if (objectMetadataItem.nameSingular !== CoreObjectNameSingular.Company) {
    return undefined;
  }

  return objectMetadataItem.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.name === COMPANY_SHORT_NAME_FIELD_NAME &&
      fieldMetadataItem.isActive,
  );
};
