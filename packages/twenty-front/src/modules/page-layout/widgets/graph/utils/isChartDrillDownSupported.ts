import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isChartDrillDownSupported = (
  field: FieldMetadataItem | undefined,
): boolean => {
  if (!isDefined(field)) {
    return false;
  }

  return field.type !== FieldMetadataType.RELATION;
};
