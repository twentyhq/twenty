import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { isDefined } from 'twenty-shared/utils';
import { WidgetGrip } from '../../components/WidgetGrip';

export type WidgetCardHeaderProps = {
  isInEditMode: boolean;
  isEmpty?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
  forbiddenDisplay?: ReactNode;
  className?: string;
};

const StyledWidgetCardHeader = styled.div`
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
  padding-inline: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  user-select: none;
`;

const StyledIconButton = styled(IconButton)`
  display: none;
`;

export const WidgetCardHeader = ({
  isEmpty = false,
  isInEditMode = false,
  title,
  onRemove,
  forbiddenDisplay,
  className,
}: WidgetCardHeaderProps) => {
  return (
    <StyledWidgetCardHeader className={className}>
      {!isEmpty && isInEditMode && (
        <WidgetGrip
          className="drag-handle"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <StyledTitle>{isEmpty ? t`Add Widget` : title}</StyledTitle>
      {isDefined(forbiddenDisplay) && forbiddenDisplay}
      {!isEmpty && isInEditMode && onRemove && (
        <StyledIconButton
          onClick={onRemove}
          Icon={IconTrash}
          variant="tertiary"
          size="small"
          className="widget-card-remove-button"
        />
      )}
    </StyledWidgetCardHeader>
  );
};
