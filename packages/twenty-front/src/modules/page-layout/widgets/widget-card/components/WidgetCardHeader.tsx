import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { WidgetGrip } from '../../components/WidgetGrip';
import { type WidgetCardContext } from '../types/WidgetCardContext';

export type WidgetCardHeaderProps = {
  isInEditMode: boolean;
  isEmpty?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
  context?: WidgetCardContext;
  hasAccess?: boolean;
  isEditing?: boolean;
  isDragging?: boolean;
  isHovered?: boolean;
  showForbiddenDisplay?: boolean;
  forbiddenDisplay?: ReactNode;
  className?: string;
};

const StyledWidgetCardHeader = styled.div<{
  context?: WidgetCardContext;
  isInEditMode?: boolean;
  hasAccess?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(6)};
  flex-shrink: 0;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  user-select: none;
`;

const StyledButtonContainer = styled.div`
  display: none;
`;
export const WidgetCardHeader = ({
  isEmpty = false,
  isInEditMode = false,
  title,
  onRemove,
  hasAccess = true,
  showForbiddenDisplay = false,
  forbiddenDisplay,
  className,
}: WidgetCardHeaderProps) => {
  return (
    <StyledWidgetCardHeader
      isInEditMode={isInEditMode}
      hasAccess={hasAccess}
      className={className}
    >
      {!isEmpty && isInEditMode && (
        <WidgetGrip
          className="drag-handle"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <StyledTitle>{isEmpty ? t`Add Widget` : title}</StyledTitle>
      {showForbiddenDisplay && forbiddenDisplay}
      {!isEmpty && isInEditMode && onRemove && (
        <StyledButtonContainer className="widget-card-remove-button">
          <IconButton
            onClick={onRemove}
            Icon={IconTrash}
            variant="tertiary"
            size="small"
          />
        </StyledButtonContainer>
      )}
    </StyledWidgetCardHeader>
  );
};
