import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { IconTrash, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { WidgetGrip } from '@/page-layout/widgets/widget-card/components/WidgetGrip';
import { isDefined } from 'twenty-shared/utils';

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
  height: ${({ theme }) => theme.spacing(6)};
  flex-shrink: 0;
`;

const StyledTitleContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding-inline: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  user-select: none;
  overflow: hidden;
`;

const StyledRightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
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
      <StyledTitleContainer>
        <OverflowingTextWithTooltip text={isEmpty ? t`Add Widget` : title} />
      </StyledTitleContainer>
      <StyledRightContainer>
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
      </StyledRightContainer>
    </StyledWidgetCardHeader>
  );
};
