import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isFieldMetadataItemLabelIdentifierFormulaEnabled = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  if (fieldMetadataItem.type !== FieldMetadataType.TEXT) {
    return false;
  }

  const settings = fieldMetadataItem.settings as
    | FieldMetadataSettingsMapping[FieldMetadataType.TEXT]
    | null;

  return isDefined(settings?.labelIdentifierFormula);
};
