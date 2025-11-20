import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';

import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableAddButtonPlaceholderCell } from '@/object-record/record-table/record-table-row/components/RecordTableAddButtonPlaceholderCell';
import { RecordTableGroupSectionLastDynamicFillingCell } from '@/object-record/record-table/record-table-row/components/RecordTableGroupSectionLastDynamicFillingCell';

import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnMinWidth';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';

import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
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
import { useIsMobile } from 'twenty-ui/utilities';

const StyledTrContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;

  div:not(:first-of-type) {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

const StyledChevronContainer = styled.div`
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  text-align: center;
  vertical-align: middle;
  width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
  min-width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;

  position: sticky;
  left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;

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
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;

  position: sticky;
  left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
  RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;

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

const StyledRecordTableDragAndDropPlaceholderCell = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;

  background-color: ${({ theme }) => theme.background.primary};

  border-bottom: 1px solid ${({ theme }) => theme.background.primary};

  position: sticky;
  left: 0;
  z-index: ${TABLE_Z_INDEX.groupSection.stickyCell};
`;

export const RecordTableRecordGroupSection = () => {
  const theme = useTheme();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const recordGroup = useRecoilValue(
    recordGroupDefinitionFamilyState(currentRecordGroupId),
  );

  const recordIndexAggregateDisplayValueForGroupValue =
    useRecoilComponentFamilyValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: recordGroup?.value ?? '' },
    );

  const recordIndexAggregateDisplayLabel = useRecoilComponentValue(
    recordIndexAggregateDisplayLabelComponentState,
  );

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const isMobile = useIsMobile();

  const widthOfLabelIdentifierRecordField = isMobile
    ? RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE
    : (visibleRecordFields.find(
        findByProperty(
          'fieldMetadataItemId',
          labelIdentifierFieldMetadataItem?.id ?? '',
        ),
      )?.size ?? RECORD_TABLE_COLUMN_MIN_WIDTH);

  const [
    isRecordGroupTableSectionToggled,
    setIsRecordGroupTableSectionToggled,
  ] = useRecoilComponentFamilyState(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
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

  const sumOfBorderWidthForFields = visibleRecordFields.length;

  const fieldsPlaceholderWidth =
    sumOfWidthOfVisibleRecordFieldsAfterLabelIdentifierField +
    sumOfBorderWidthForFields;

  if (!isDefined(recordGroup)) {
    return null;
  }

  return (
    <StyledTrContainer onClick={handleDropdownToggle}>
      <StyledRecordTableDragAndDropPlaceholderCell />
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
        width={widthOfLabelIdentifierRecordField}
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
          aggregateValue={recordIndexAggregateDisplayValueForGroupValue}
          dropdownId={`record-group-section-aggregate-dropdown-${currentRecordGroupId}`}
          objectMetadataItem={objectMetadataItem}
          aggregateLabel={recordIndexAggregateDisplayLabel}
        />
      </StyledRecordGroupSection>
      <StyledFieldPlaceholderCell widthOfFields={fieldsPlaceholderWidth} />
      <RecordTableAddButtonPlaceholderCell />
      <RecordTableGroupSectionLastDynamicFillingCell />
    </StyledTrContainer>
  );
};
