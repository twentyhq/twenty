import styled from '@emotion/styled';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnMinWidth';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableDragAndDropPlaceholderCell } from '@/object-record/record-table/record-table-cell/components/RecordTableDragAndDropPlaceholderCell';
import { RecordTableAddButtonPlaceholderCell } from '@/object-record/record-table/record-table-row/components/RecordTableAddButtonPlaceholderCell';
import { RecordTableGroupSectionLastDynamicFillingCell } from '@/object-record/record-table/record-table-row/components/RecordTableGroupSectionLastDynamicFillingCell';
import { useTheme } from '@emotion/react';
import {
  filterOutByProperty,
  findByProperty,
  sumByProperty,
} from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledDragDropPlaceholderCell = styled(
  RecordTableDragAndDropPlaceholderCell,
)`
  left: 0;
  position: sticky;
`;

const StyledFieldPlaceholderCell = styled.div<{ widthOfFields: number }>`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  min-width: ${({ widthOfFields }) => widthOfFields}px;
  width: ${({ widthOfFields }) => widthOfFields}px;
`;

const StyledRecordTableDraggableTr = styled.div`
  cursor: pointer;

  border: none;
  background: ${({ theme }) => theme.background.primary};

  display: flex;
  flex-direction: row;
  align-items: center;

  &:hover {
    div:not(:first-of-type) {
      background-color: ${({ theme }) => theme.background.secondary};
    }
  }

  div:not(:first-of-type) {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }

  width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  background-color: transparent;
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  justify-content: center;
  width: ${RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;

  position: sticky;
  left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
`;

const StyledActionTextContainer = styled.div<{ width: number }>`
  align-items: center;

  border-right: none;
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  justify-content: start;

  left: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
  RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
  position: sticky;
  width: ${({ width }) => width}px;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.md};
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;

  position: absolute;
`;

type RecordTableActionRowProps = {
  LeftIcon: IconComponent;
  text: string;
  onClick?: (event?: React.MouseEvent<HTMLDivElement>) => void;
};

export const RecordTableActionRow = ({
  LeftIcon,
  text,
  onClick,
}: RecordTableActionRowProps) => {
  const theme = useTheme();

  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordFieldsWithoutLabelIdentifier = visibleRecordFields.filter(
    filterOutByProperty(
      'fieldMetadataItemId',
      labelIdentifierFieldMetadataItem?.id,
    ),
  );

  const isMobile = useIsMobile();

  const labelIdentifierRecordField = visibleRecordFields.find(
    findByProperty('fieldMetadataItemId', labelIdentifierFieldMetadataItem?.id),
  );

  const firstColumnWidth = isMobile
    ? RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE
    : (labelIdentifierRecordField?.size ?? RECORD_TABLE_COLUMN_MIN_WIDTH);

  const sumOfWidthOfVisibleRecordFieldsAfterLabelIdentifierField =
    visibleRecordFieldsWithoutLabelIdentifier.reduce(sumByProperty('size'), 0);

  const sumOfBorderWidthForFields =
    visibleRecordFieldsWithoutLabelIdentifier.length;

  return (
    <StyledRecordTableDraggableTr onClick={onClick}>
      <StyledDragDropPlaceholderCell />
      <StyledIconContainer>
        <LeftIcon
          stroke={theme.icon.stroke.sm}
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      </StyledIconContainer>
      <StyledActionTextContainer width={firstColumnWidth}>
        <StyledText>{text}</StyledText>
      </StyledActionTextContainer>
      <StyledFieldPlaceholderCell
        widthOfFields={
          sumOfWidthOfVisibleRecordFieldsAfterLabelIdentifierField +
          sumOfBorderWidthForFields
        }
      />
      <RecordTableAddButtonPlaceholderCell />
      <RecordTableGroupSectionLastDynamicFillingCell />
    </StyledRecordTableDraggableTr>
  );
};
