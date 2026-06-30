import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { RecordGroupRelationChip } from '@/object-record/record-group/components/RecordGroupRelationChip';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';

type RecordGroupChipProps = {
  recordGroupDefinition: RecordGroupDefinition;
  fieldMetadataItem?: FieldMetadataItem | null;
  valueTagWeight?: 'regular' | 'medium';
};

export const RecordGroupChip = ({
  recordGroupDefinition,
  fieldMetadataItem,
  valueTagWeight = 'regular',
}: RecordGroupChipProps) => {
  const isValueGroup =
    recordGroupDefinition.type === RecordGroupDefinitionType.Value;

  if (
    isValueGroup &&
    isDefined(fieldMetadataItem) &&
    isManyToOneRelationField(fieldMetadataItem) &&
    isDefined(recordGroupDefinition.value)
  ) {
    return (
      <RecordGroupRelationChip
        fieldMetadataItem={fieldMetadataItem}
        recordId={recordGroupDefinition.value}
      />
    );
  }

  return (
    <Tag
      variant={isValueGroup ? 'solid' : 'outline'}
      color={isValueGroup ? recordGroupDefinition.color : 'transparent'}
      text={recordGroupDefinition.title}
      weight={isValueGroup ? valueTagWeight : 'medium'}
    />
  );
};
