import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { RecordGroupRelationChip } from '@/object-record/record-group/components/RecordGroupRelationChip';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

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

  const tag = (
    <Tag
      variant={isValueGroup ? 'soft' : 'outline'}
      borderStyle="dashed"
      color={isValueGroup ? recordGroupDefinition.color : 'transparent'}
      weight={isValueGroup ? valueTagWeight : 'medium'}
    >
      {recordGroupDefinition.title}
    </Tag>
  );

  if (!isNonEmptyString(recordGroupDefinition.description)) {
    return tag;
  }

  return (
    <Tooltip
      content={recordGroupDefinition.description}
      side="bottom"
      delay={TooltipDelay.mediumDelay}
      positionMethod="fixed"
    >
      {tag}
    </Tooltip>
  );
};
