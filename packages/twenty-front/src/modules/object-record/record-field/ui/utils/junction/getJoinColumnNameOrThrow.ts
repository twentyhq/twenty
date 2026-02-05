import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getJoinColumnName';
import { isDefined } from 'twenty-shared/utils';

export const getJoinColumnNameOrThrow = (
  settings: FieldMetadataItem['settings'],
): string => {
  const joinColumnName = getJoinColumnName(settings);
  if (!isDefined(joinColumnName)) {
    throw new Error('Join column name is not defined');
  }
  return joinColumnName;
};
