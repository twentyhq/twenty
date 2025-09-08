import styled from '@emotion/styled';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useTheme } from '@emotion/react';
import {
  filterOutByProperty,
  findByProperty,
  sumByProperty,
} from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

const StyledDragDropPlaceholderCell = styled.div`
  min-width: 16px;
  width: 16px;

  position: sticky;
  left: 0;
`;

const StyledPlusButtonPlaceholderCell = styled.div`
  height: 32px;
  min-width: 32px;
  width: 32px;
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledFieldPlaceholderCell = styled.div<{ widthOfFields: number }>`
  height: 32px;
  min-width: ${({ widthOfFields }) => widthOfFields}px;
  width: ${({ widthOfFields }) => widthOfFields}px;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledRecordTableDraggableTr = styled.div`
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.animation.duration.fast}
    ease-in-out;
  border: none;
  background: ${({ theme }) => theme.background.primary};

  display: flex;
  flex-direction: row;
  align-items: center;

  &:hover {
    div:not(:first-of-type) {
      background-color: ${({ theme }) => theme.background.transparent.light};
    }
  }

  div {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    background-color: ${({ theme }) => theme.background.primary};
    transition: background-color ${({ theme }) => theme.animation.duration.fast}
      ease-in-out;

    &:first-of-type {
      border-bottom: 1px solid ${({ theme }) => theme.background.primary};
    }
  }

  width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  background-color: transparent;
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;

  position: sticky;
  left: 16px;
`;

const StyledRecordTableTdTextContainer = styled.div<{ width: number }>`
  align-items: center;
  background-color: transparent;
  border-right: none;
  display: flex;

  height: 32px;
  justify-content: start;

  left: 48px;
  position: sticky;
  width: ${({ width }) => width}px;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.md};
  text-align: center;
  vertical-align: middle;
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

  const labelIdentifierRecordField = visibleRecordFields.find(
    findByProperty('fieldMetadataItemId', labelIdentifierFieldMetadataItem?.id),
  );

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
      <StyledRecordTableTdTextContainer
        width={labelIdentifierRecordField?.size ?? 104}
      >
        <StyledText>{text}</StyledText>
      </StyledRecordTableTdTextContainer>
      <StyledFieldPlaceholderCell
        widthOfFields={
          sumOfWidthOfVisibleRecordFieldsAfterLabelIdentifierField +
          sumOfBorderWidthForFields
        }
      />
      <StyledPlusButtonPlaceholderCell />
    </StyledRecordTableDraggableTr>
  );
};
