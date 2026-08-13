import { RecordGroupAggregateDropdown } from '@/object-record/record-group/components/RecordGroupAggregateDropdown';
import { RecordGroupSectionHeader } from '@/object-record/record-group/components/RecordGroupSectionHeader';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { isRecordListGroupSectionToggledComponentState } from '@/object-record/record-list/states/isRecordListGroupSectionToggledComponentState';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 32px;
  margin-bottom: 2px;
`;

export const RecordListRecordGroupSection = () => {
  const { objectMetadataItem } = useRecordListContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    currentRecordGroupId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexAggregateDisplayValueForGroupValue =
    useAtomComponentFamilyStateValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: recordGroupDefinition?.value ?? '' },
    );

  const recordIndexAggregateDisplayLabel = useAtomComponentStateValue(
    recordIndexAggregateDisplayLabelComponentState,
  );

  const [isRecordListGroupSectionToggled, setIsRecordListGroupSectionToggled] =
    useAtomComponentFamilyState(
      isRecordListGroupSectionToggledComponentState,
      currentRecordGroupId,
    );

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <StyledSectionHeader>
      <RecordGroupSectionHeader
        recordGroupDefinition={recordGroupDefinition}
        fieldMetadataItem={recordIndexGroupFieldMetadataItem}
        isExpanded={isRecordListGroupSectionToggled}
        onToggle={() =>
          setIsRecordListGroupSectionToggled((prevState) => !prevState)
        }
      />
      <RecordGroupAggregateDropdown
        aggregateValue={recordIndexAggregateDisplayValueForGroupValue}
        dropdownId={`record-list-group-section-aggregate-dropdown-${currentRecordGroupId}`}
        objectMetadataItem={objectMetadataItem}
        aggregateLabel={recordIndexAggregateDisplayLabel}
      />
    </StyledSectionHeader>
  );
};
