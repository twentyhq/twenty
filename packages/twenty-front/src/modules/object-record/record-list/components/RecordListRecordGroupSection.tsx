import { RecordGroupAggregateDropdown } from '@/object-record/record-group/components/RecordGroupAggregateDropdown';
import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
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
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 32px;
  margin-bottom: 2px;
`;

const StyledSectionToggle = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  padding: 0;
`;

const StyledChevronContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  transform: rotate(${({ isExpanded }) => (isExpanded ? 0 : -90)}deg);
`;

export const RecordListRecordGroupSection = () => {
  const { theme } = useContext(ThemeContext);
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

  if (recordGroupDefinition === undefined) {
    return null;
  }

  return (
    <StyledSectionHeader>
      <StyledSectionToggle
        type="button"
        aria-expanded={isRecordListGroupSectionToggled}
        aria-label={t`Toggle ${recordGroupDefinition.title} group`}
        onClick={() =>
          setIsRecordListGroupSectionToggled((prevState) => !prevState)
        }
      >
        <StyledChevronContainer isExpanded={isRecordListGroupSectionToggled}>
          <IconChevronDown
            aria-hidden
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
        </StyledChevronContainer>
        <RecordGroupChip
          recordGroupDefinition={recordGroupDefinition}
          fieldMetadataItem={recordIndexGroupFieldMetadataItem}
          valueTagWeight="medium"
        />
      </StyledSectionToggle>
      <RecordGroupAggregateDropdown
        aggregateValue={recordIndexAggregateDisplayValueForGroupValue}
        dropdownId={`record-list-group-section-aggregate-dropdown-${currentRecordGroupId}`}
        objectMetadataItem={objectMetadataItem}
        aggregateLabel={recordIndexAggregateDisplayLabel}
      />
    </StyledSectionHeader>
  );
};
