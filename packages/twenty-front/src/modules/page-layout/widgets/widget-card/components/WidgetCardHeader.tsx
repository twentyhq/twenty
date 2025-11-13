import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { IconTrash, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { WidgetGrip } from '@/page-layout/widgets/widget-card/components/WidgetGrip';
import { AnimatePresence, motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';

export type WidgetCardHeaderProps = {
  widgetId: string;
  isInEditMode: boolean;
  isEmpty?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
  forbiddenDisplay?: ReactNode;
  className?: string;
  isResizing?: boolean;
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

const StyledIconButtonContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WidgetCardHeader = ({
  widgetId,
  isEmpty = false,
  isInEditMode = false,
  isResizing = false,
  title,
  onRemove,
  forbiddenDisplay,
  className,
}: WidgetCardHeaderProps) => {
  const theme = useTheme();

  const isWidgetCardHovered = useRecoilComponentFamilyValue(
    widgetCardHoveredComponentFamilyState,
    widgetId,
  );

  return (
    <StyledWidgetCardHeader className={className}>
      <AnimatePresence>
        {!isEmpty && isInEditMode && (
          <WidgetGrip
            className="drag-handle"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </AnimatePresence>
      <StyledTitleContainer>
        <OverflowingTextWithTooltip text={isEmpty ? t`Add Widget` : title} />
      </StyledTitleContainer>
      <StyledRightContainer>
        {isDefined(forbiddenDisplay) && forbiddenDisplay}
        <AnimatePresence>
          {!isResizing &&
            !isEmpty &&
            isInEditMode &&
            onRemove &&
            isWidgetCardHovered && (
              <StyledIconButtonContainer
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{
                  duration: theme.animation.duration.fast,
                  ease: 'easeInOut',
                }}
              >
                <IconButton
                  onClick={onRemove}
                  Icon={IconTrash}
                  variant="tertiary"
                  size="small"
                />
              </StyledIconButtonContainer>
            )}
        </AnimatePresence>
      </StyledRightContainer>
    </StyledWidgetCardHeader>
  );
};
