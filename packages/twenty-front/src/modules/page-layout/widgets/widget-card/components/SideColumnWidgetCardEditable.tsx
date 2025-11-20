import { BaseWidgetCard } from '@/page-layout/widgets/widget-card/components/BaseWidgetCard';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

export type SideColumnWidgetCardEditableProps = {
  isEditing: boolean;
  isDragging: boolean;
  isResizing: boolean;
  onClick?: () => void;
};

const StyledSideColumnWidgetCardEditable = styled(
  BaseWidgetCard,
)<SideColumnWidgetCardEditableProps>`
  border: none;
  padding: 0;
  border-radius: 0;
  background: ${({ theme }) => theme.background.secondary};

  ${({ isEditing, isDragging, isResizing, onClick }) =>
    !isDragging &&
    !isEditing &&
    !isResizing &&
    css`
      &:hover {
        cursor: ${isDefined(onClick) ? 'pointer' : 'default'};
      }
    `}
`;

export { StyledSideColumnWidgetCardEditable as SideColumnWidgetCardEditable };
