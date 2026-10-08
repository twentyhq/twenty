import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Dropdown } from 'twenty-ui/components/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { aggregateOperationComponentState } from '@/object-record/record-group/states/aggregateOperationComponentState';
import { availableFieldIdsForAggregateOperationComponentState } from '@/object-record/record-group/states/availableFieldIdsForAggregateOperationComponentState';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useUpdateViewAggregate } from '@/views/hooks/useUpdateViewAggregate';
import { isDefined } from 'twenty-shared/utils';
import { Icon123, useIcons } from 'twenty-ui/icon';

type RecordGroupAggregateDropdownFieldsContentProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const RecordGroupAggregateDropdownFieldsContent = ({
  objectMetadataItem,
}: RecordGroupAggregateDropdownFieldsContentProps) => {
  const { updateViewAggregate } = useUpdateViewAggregate();

  const { getIcon } = useIcons();

  const aggregateOperation = useAtomComponentStateValue(
    aggregateOperationComponentState,
  );

  const availableFieldIdsForAggregateOperation = useAtomComponentStateValue(
    availableFieldIdsForAggregateOperationComponentState,
  );

  const recordIndexGroupAggregateOperation = useAtomComponentStateValue(
    recordIndexGroupAggregateOperationComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  if (!isDefined(aggregateOperation)) {
    return <></>;
  }

  return (
    <>
      <Dropdown.Back>
        {getAggregateOperationLabel(aggregateOperation)}
      </Dropdown.Back>
      <Dropdown.Section>
        {availableFieldIdsForAggregateOperation.map((fieldId) => {
          const fieldMetadata = objectMetadataItem.fields.find(
            (field) => field.id === fieldId,
          );

          if (!isDefined(fieldMetadata)) return null;

          const isSelected =
            recordIndexGroupAggregateFieldMetadataItem?.id === fieldId &&
            recordIndexGroupAggregateOperation === aggregateOperation;

          return (
            <Dropdown.OptionItem
              key={fieldId}
              onClick={() => {
                updateViewAggregate({
                  kanbanAggregateOperationFieldMetadataId: fieldId,
                  kanbanAggregateOperation: aggregateOperation,
                  objectMetadataItem,
                });
              }}
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(fieldMetadata.icon) ?? Icon123}
                />
              }
              indicator="check"
              selected={isSelected}
            >
              {fieldMetadata.label}
            </Dropdown.OptionItem>
          );
        })}
      </Dropdown.Section>
    </>
  );
};
