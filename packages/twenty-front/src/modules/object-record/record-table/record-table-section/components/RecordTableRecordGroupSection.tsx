import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';

import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { RecordTableRecordGroupStickyEffect } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupStickyEffect';
import { useAggregateRecordsForRecordTableSection } from '@/object-record/record-table/record-table-section/hooks/useAggregateRecordsForRecordTableSection';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/display';
import { AnimatedLightIconButton } from 'twenty-ui/input';

const StyledTrContainer = styled.tr`
  cursor: pointer;
`;

const StyledChevronContainer = styled(RecordTableTd)`
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
  vertical-align: middle;
`;

const StyledAnimatedLightIconButton = styled(AnimatedLightIconButton)`
  display: block;
  margin: auto;
`;

const StyledRecordGroupSection = styled(RecordTableTd)`
  border-right: none;
  height: 32px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledEmptyTd = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTag = styled(Tag)`
  flex-shrink: 0;
`;

export const RecordTableRecordGroupSection = () => {
  const theme = useTheme();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const visibleColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
  );

  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { aggregateValue, aggregateLabel } =
    useAggregateRecordsForRecordTableSection();

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

  if (!isDefined(recordGroup)) {
    return null;
  }

  return (
    <StyledTrContainer onClick={handleDropdownToggle}>
      <td aria-hidden />
      <StyledChevronContainer>
        <StyledAnimatedLightIconButton
          Icon={IconChevronDown}
          size="small"
          accent="secondary"
          animate={{ rotate: !isRecordGroupTableSectionToggled ? -90 : 0 }}
          transition={{ duration: theme.animation.duration.normal }}
        />
      </StyledChevronContainer>
      <StyledRecordGroupSection className="disable-shadow">
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
      <StyledEmptyTd colSpan={visibleColumns.length - 1} />
      <StyledEmptyTd />
      <StyledEmptyTd />
    </StyledTrContainer>
  );
};
