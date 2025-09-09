import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';

import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRecordGroupStickyEffect } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupStickyEffect';
import { useAggregateRecordsForRecordTableSection } from '@/object-record/record-table/record-table-section/hooks/useAggregateRecordsForRecordTableSection';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import {
  filterOutByProperty,
  findByProperty,
  isDefined,
  sumByProperty,
} from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/display';
import { AnimatedLightIconButton } from 'twenty-ui/input';

const StyledDragDropHeaderPlaceholder = styled.div`
  min-width: 16px;
  width: 16px;
  position: sticky;
  left: 0;
`;

const StyledTrContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
`;

const StyledChevronContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  text-align: center;
  vertical-align: middle;
  width: 32px;
  min-width: 32px;

  position: sticky;
  left: 16px;
`;

const StyledAnimatedLightIconButton = styled(AnimatedLightIconButton)`
  display: block;
  margin: auto;
`;

const StyledRecordGroupSection = styled.div<{ width: number }>`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-right: none;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 32px;
  width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;

  position: sticky;
  left: 48px;
`;

const StyledTag = styled(Tag)`
  flex-shrink: 0;
`;

const StyledPlusButtonPlaceholderCell = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: 32px;
  min-width: 32px;
  width: 32px;
`;

const StyledFieldPlaceholderCell = styled.div<{ widthOfFields: number }>`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: 32px;
  min-width: ${({ widthOfFields }) => widthOfFields}px;
  width: ${({ widthOfFields }) => widthOfFields}px;
`;

export const RecordTableRecordGroupSection = () => {
  const theme = useTheme();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { aggregateValue, aggregateLabel } =
    useAggregateRecordsForRecordTableSection();

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const widthOfLabelIdentifierRecordField =
    visibleRecordFields.find(
      findByProperty(
        'fieldMetadataItemId',
        labelIdentifierFieldMetadataItem?.id ?? '',
      ),
    )?.size ?? null;

  const [
    isRecordGroupTableSectionToggled,
    setIsRecordGroupTableSectionToggled,
  ] = useRecoilComponentFamilyState(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
  );

  const recordGroup = useRecoilValue(
    recordGroupDefinitionFamilyState(currentRecordGroupId),
  );

  const handleDropdownToggle = useCallback(() => {
    setIsRecordGroupTableSectionToggled((prevState) => !prevState);
  }, [setIsRecordGroupTableSectionToggled]);

  const visibleRecordFieldsWithoutLabelIdentifier = visibleRecordFields.filter(
    filterOutByProperty(
      'fieldMetadataItemId',
      labelIdentifierFieldMetadataItem?.id,
    ),
  );

  const sumOfWidthOfVisibleRecordFieldsAfterLabelIdentifierField =
    visibleRecordFieldsWithoutLabelIdentifier.reduce(sumByProperty('size'), 0);

  const sumOfBorderWidthForFields =
    visibleRecordFieldsWithoutLabelIdentifier.length;

  const fieldsPlaceholderWidth =
    sumOfWidthOfVisibleRecordFieldsAfterLabelIdentifierField +
    sumOfBorderWidthForFields;

  if (!isDefined(recordGroup)) {
    return null;
  }

  return (
    <StyledTrContainer onClick={handleDropdownToggle}>
      <StyledDragDropHeaderPlaceholder />
      <StyledChevronContainer>
        <StyledAnimatedLightIconButton
          Icon={IconChevronDown}
          size="small"
          accent="secondary"
          animate={{ rotate: !isRecordGroupTableSectionToggled ? -90 : 0 }}
          transition={{ duration: theme.animation.duration.normal }}
        />
      </StyledChevronContainer>
      <StyledRecordGroupSection
        className="disable-shadow"
        width={widthOfLabelIdentifierRecordField ?? 104}
      >
        <StyledTag
          variant={
            recordGroup.type !== RecordGroupDefinitionType.NoValue
              ? 'solid'
              : 'outline'
          }
          color={
            recordGroup.type !== RecordGroupDefinitionType.NoValue
              ? recordGroup.color
              : 'transparent'
          }
          text={recordGroup.title}
          weight="medium"
        />
        <RecordBoardColumnHeaderAggregateDropdown
          aggregateValue={aggregateValue}
          dropdownId={`record-group-section-aggregate-dropdown-${currentRecordGroupId}`}
          objectMetadataItem={objectMetadataItem}
          aggregateLabel={aggregateLabel}
        />
        <RecordTableRecordGroupStickyEffect />
      </StyledRecordGroupSection>
      <StyledFieldPlaceholderCell widthOfFields={fieldsPlaceholderWidth} />
      <StyledPlusButtonPlaceholderCell />
    </StyledTrContainer>
  );
};
