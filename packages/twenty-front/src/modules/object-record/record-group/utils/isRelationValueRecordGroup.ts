import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { isDefined } from 'twenty-shared/utils';

export const isRelationValueRecordGroup = ({
  fieldMetadataItem,
  recordGroupDefinition,
}: {
  fieldMetadataItem:
    | Pick<FieldMetadataItem, 'type' | 'relation'>
    | undefined
    | null;
  recordGroupDefinition: Pick<RecordGroupDefinition, 'type' | 'value'>;
}): boolean =>
  isDefined(fieldMetadataItem) &&
  isManyToOneRelationField(fieldMetadataItem) &&
  recordGroupDefinition.type === RecordGroupDefinitionType.Value &&
  isDefined(recordGroupDefinition.value);
