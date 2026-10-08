import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOnDemandField } from '@/object-record/record-field/on-demand/utils/isOnDemandField';
import { isDefined } from 'twenty-shared/utils';

export const getIsOnDemandFieldEnabled = ({
  isOnDemandFieldsEnabled = false,
  fieldMetadataItem,
}: {
  isOnDemandFieldsEnabled?: boolean;
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'settings'>;
}): boolean =>
  isOnDemandFieldsEnabled &&
  isDefined(fieldMetadataItem) &&
  isOnDemandField(fieldMetadataItem);
