import { BaseWidgetCard } from '@/page-layout/widgets/widget-card/components/BaseWidgetCard';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

export type RecordPageWidgetCardEditableProps = {
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  onClick?: () => void;
};

const StyledRecordPageWidgetCardEditable = styled(
  BaseWidgetCard,
)<RecordPageWidgetCardEditableProps>`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.md};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ theme, isEditing, isDragging, isResizing, onClick }) =>
    !isDragging &&
    !isEditing &&
    !isResizing &&
    css`
      &:hover {
        border: 1px solid ${theme.border.color.strong};
        cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
      }
    `}

  ${({ theme, isEditing, isDragging }) =>
    isEditing &&
    !isDragging &&
    css`
      border: 1px solid ${theme.color.blue} !important;
    `}

  ${({ theme, isDragging }) =>
    isDragging &&
    css`
      background: linear-gradient(
          0deg,
          ${theme.background.transparent.lighter} 0%,
          ${theme.background.transparent.lighter} 100%
        ),
        ${theme.background.secondary};
      border: 1px solid ${theme.color.blue} !important;
    `}
`;

export { StyledRecordPageWidgetCardEditable as RecordPageWidgetCardEditable };
