import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';

import { useAICElement } from '@aicorg/sdk-react';
import { isNonEmptyString } from '@sniptt/guards';
import { useIcons } from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type EditableFilterChipProps = {
  recordFilter: RecordFilter;
  onRemove: () => void;
  onClick?: () => void;
};

export const EditableFilterChip = ({
  recordFilter,
  onRemove,
  onClick,
}: EditableFilterChipProps) => {
  const { getIcon } = useIcons();

  const { fieldMetadataItem } = useFieldMetadataItemByIdOrThrow(
    recordFilter.fieldMetadataId,
  );

  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const recordFilterSubFieldName = recordFilter.subFieldName;

  const subFieldLabel =
    isCompositeFieldType(fieldMetadataItem.type) &&
    fieldMetadataItem.type !== FieldMetadataType.ACTOR &&
    isNonEmptyString(recordFilterSubFieldName) &&
    isValidSubFieldName(recordFilterSubFieldName)
      ? getCompositeSubFieldLabel(
          fieldMetadataItem.type,
          recordFilterSubFieldName,
        )
      : '';

  const fieldNameLabel = isNonEmptyString(subFieldLabel)
    ? `${recordFilter.label} / ${subFieldLabel}`
    : recordFilter.label;

  const labelKey = `${fieldNameLabel}`;
  const labelValue = getRecordFilterChipLabelValue({
    recordFilter,
  });
  const { attributes } = useAICElement({
    agentId: `opportunity.view.filter.active.${fieldMetadataItem.name}.${recordFilter.id}`,
    agentAction: 'open',
    agentDescription: `Inspect or edit the active ${fieldMetadataItem.label} filter on the current opportunities view.`,
    agentEntityId: recordFilter.id,
    agentEntityLabel: fieldMetadataItem.label,
    agentEntityType: 'opportunity_filter',
    agentLabel: `Active opportunity filter for ${fieldMetadataItem.label}`,
    agentRisk: 'low',
    agentWorkflowStep: 'opportunity.view.inspect_active_filter',
  });

  const removeAttributes = {
    'data-agent-id': `opportunity.view.filter.remove.${fieldMetadataItem.name}.${recordFilter.id}`,
    'data-agent-action': 'click',
    'data-agent-description': `Remove the active ${fieldMetadataItem.label} filter from the current opportunities view.`,
    'data-agent-entity-id': recordFilter.id,
    'data-agent-entity-label': fieldMetadataItem.label,
    'data-agent-entity-type': 'opportunity_filter',
    'data-agent-label': `Remove active opportunity filter for ${fieldMetadataItem.label}`,
    'data-agent-risk': 'low',
    'data-agent-workflow': 'opportunity.view.clear_active_filter',
  };

  return (
    <div {...attributes}>
      <SortOrFilterChip
        key={recordFilter.id}
        testId={recordFilter.id}
        labelKey={labelKey}
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
