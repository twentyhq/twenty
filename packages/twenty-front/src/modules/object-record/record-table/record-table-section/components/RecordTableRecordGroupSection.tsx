import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';

import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableAddButtonPlaceholderCell } from '@/object-record/record-table/record-table-row/components/RecordTableAddButtonPlaceholderCell';
import { RecordTableLastDynamicFillingCell } from '@/object-record/record-table/record-table-row/components/RecordTableLastDynamicFillingCell';
import { RecordTableRecordGroupStickyEffect } from '@/object-record/record-table/record-table-section/components/RecordTableRecordGroupStickyEffect';
import { useAggregateRecordsForRecordTableSection } from '@/object-record/record-table/record-table-section/hooks/useAggregateRecordsForRecordTableSection';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
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

const StyledTrContainer = styled.div<{ shouldDisplayBorderBottom: boolean }>`
  cursor: pointer;
  display: flex;
  flex-direction: row;

  div:not(:first-of-type) {
    border-bottom: ${({ theme, shouldDisplayBorderBottom }) =>
      shouldDisplayBorderBottom
        ? `1px solid ${theme.border.color.light}`
        : 'none'};
  }
`;

const StyledChevronContainer = styled.div`
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  text-align: center;
  vertical-align: middle;
  width: 32px;
  min-width: 32px;

  position: sticky;
  left: 16px;

  z-index: ${TABLE_Z_INDEX.groupSection.stickyCell};
`;

const StyledAnimatedLightIconButton = styled(AnimatedLightIconButton)`
  display: block;
  margin: auto;

  z-index: ${TABLE_Z_INDEX.groupSection.stickyCell};
`;

const StyledRecordGroupSection = styled.div<{ width: number }>`
  align-items: center;
  border-right: none;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 32px;
  width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;

  position: sticky;
  left: 48px;

  z-index: ${TABLE_Z_INDEX.groupSection.stickyCell};
`;

const StyledTag = styled(Tag)`
  flex-shrink: 0;
`;

const StyledFieldPlaceholderCell = styled.div<{ widthOfFields: number }>`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  min-width: ${({ widthOfFields }) => widthOfFields}px;
  width: ${({ widthOfFields }) => widthOfFields}px;

  z-index: ${TABLE_Z_INDEX.groupSection.normalCell};
`;

const StyledRecordTableDragAndDropPlaceholderCell = styled.div<{
  shouldDisplayBorderBottom: boolean;
}>`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;

  background-color: ${({ theme }) => theme.background.primary};

  border-bottom: ${({ theme, shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${theme.background.primary}`
      : 'none'};

  position: sticky;
  left: 0;
  z-index: ${TABLE_Z_INDEX.groupSection.stickyCell};
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

  const allRecordIds = useRecoilComponentValue(
    recordIndexAllRecordIdsComponentSelector,
  );

  const recordIdsOfThisGroup = useRecoilComponentFamilyValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordGroup?.id ?? '',
  );

  const indexOfFirstRowOfThisGroup = allRecordIds.findIndex(
    (value) => value === recordIdsOfThisGroup[0],
  );

  const isFirstRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    indexOfFirstRowOfThisGroup,
  );

  const isFirstRowFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    indexOfFirstRowOfThisGroup,
  );

  const isFirstRowActiveOrFocused = isFirstRowActive || isFirstRowFocused;

  const shouldDisplayBorderBottom = !isFirstRowActiveOrFocused;

  if (!isDefined(recordGroup)) {
    return null;
  }

  return (
    <StyledTrContainer
      onClick={handleDropdownToggle}
      shouldDisplayBorderBottom={shouldDisplayBorderBottom}
    >
      <StyledRecordTableDragAndDropPlaceholderCell
        shouldDisplayBorderBottom={shouldDisplayBorderBottom}
      />
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
      <RecordTableAddButtonPlaceholderCell />
      <RecordTableLastDynamicFillingCell />
    </StyledTrContainer>
  );
};
