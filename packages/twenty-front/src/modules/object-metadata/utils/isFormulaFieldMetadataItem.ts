import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  getFieldMetadataFormulaExpression,
  isDefined,
} from 'twenty-shared/utils';

export const isFormulaFieldMetadataItem = (
  fieldMetadataItem: Partial<Pick<FieldMetadataItem, 'settings'>>,
): boolean => isDefined(getFieldMetadataFormulaExpression(fieldMetadataItem));
