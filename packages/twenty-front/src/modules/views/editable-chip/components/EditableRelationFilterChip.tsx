import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useComputeRecordRelationFilterLabelValue } from '@/views/hooks/useComputeRecordRelationFilterLabelValue';
import { useAICElement } from '@aicorg/sdk-react';
import { useIcons } from 'twenty-ui/display';

type EditableRelationFilterChipProps = {
  recordFilter: RecordFilter;
  onRemove: () => void;
  onClick?: () => void;
};

export const EditableRelationFilterChip = ({
  recordFilter,
  onRemove,
  onClick,
}: EditableRelationFilterChipProps) => {
  const { getIcon } = useIcons();

  const { fieldMetadataItem } = useFieldMetadataItemByIdOrThrow(
    recordFilter.fieldMetadataId,
  );

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const { labelValue } = useComputeRecordRelationFilterLabelValue({
    recordFilter,
  });
  const { attributes } = useAICElement({
    agentId: `opportunity.view.filter.active.${fieldMetadataItem.name}.${recordFilter.id}`,
    agentAction: 'open',
    agentDescription: `Inspect or edit the active ${fieldMetadataItem.label} relation filter on the current opportunities view.`,
    agentEntityId: recordFilter.id,
    agentEntityLabel: fieldMetadataItem.label,
    agentEntityType: 'opportunity_filter',
    agentLabel: `Active opportunity relation filter for ${fieldMetadataItem.label}`,
    agentRisk: 'low',
    agentWorkflowStep: 'opportunity.view.inspect_active_filter',
  });

  const removeAttributes = {
    'data-agent-id': `opportunity.view.filter.remove.${fieldMetadataItem.name}.${recordFilter.id}`,
    'data-agent-action': 'click',
    'data-agent-description': `Remove the active ${fieldMetadataItem.label} relation filter from the current opportunities view.`,
    'data-agent-entity-id': recordFilter.id,
    'data-agent-entity-label': fieldMetadataItem.label,
    'data-agent-entity-type': 'opportunity_filter',
    'data-agent-label': `Remove active opportunity relation filter for ${fieldMetadataItem.label}`,
    'data-agent-risk': 'low',
    'data-agent-workflow': 'opportunity.view.clear_active_filter',
  };

  return (
    <div {...attributes}>
      <SortOrFilterChip
        key={recordFilter.id}
        testId={recordFilter.id}
        labelKey={fieldMetadataItem.label}
        labelValue={labelValue}
        Icon={FieldMetadataItemIcon}
        onRemove={onRemove}
        onClick={onClick}
        removeButtonProps={removeAttributes}
        type="filter"
      />
    </div>
  );
};
