import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { WidgetCardHeaderActionsRenderer } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionsRenderer';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useContext } from 'react';
import { IconTrash } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { IconButton } from 'twenty-ui/input';

import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { WidgetGrip } from '@/page-layout/widgets/widget-card/components/WidgetGrip';
import { AnimatePresence, motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
export type WidgetCardHeaderProps = {
  variant: WidgetCardVariant;
  widgetId: string;
  isInEditMode: boolean;
  isEmpty?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
  forbiddenDisplay?: ReactNode;
  className?: string;
  isResizing?: boolean;
  isReorderEnabled?: boolean;
  isDeletingWidgetEnabled?: boolean;
};

const StyledWidgetCardHeader = styled.div<{ variant: WidgetCardVariant }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[6]};
  padding: ${({ variant }) =>
    variant === 'solo'
      ? `${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]} 0`
      : '0'};
`;

const StyledTitleContainer = styled.div<{ variant: WidgetCardVariant }>`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  padding-inline: ${({ variant }) =>
    variant === 'side-column' || variant === 'solo'
      ? '0'
      : themeCssVariables.spacing[1]};

  user-select: none;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
`;

const StyledIconButtonContainerBase = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;
const StyledIconButtonContainer = motion.create(StyledIconButtonContainerBase);

export const WidgetCardHeader = ({
  widgetId,
  variant,
  isEmpty = false,
  isInEditMode = false,
  isResizing = false,
  isReorderEnabled = true,
  isDeletingWidgetEnabled = true,
  title,
  onRemove,
  forbiddenDisplay,
  className,
}: WidgetCardHeaderProps) => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();
  const widgetCardHovered = useAtomComponentFamilyStateValue(
    widgetCardHoveredComponentFamilyState,
    widgetId,
  );

  const widgetHeaderCount = useAtomComponentFamilyStateValue(
    widgetHeaderCountComponentFamilyState,
    widgetId,
  );

  return (
    <StyledWidgetCardHeader variant={variant} className={className}>
      <AnimatePresence initial={false}>
        {!isEmpty && isInEditMode && isReorderEnabled && (
          <WidgetGrip
            className="drag-handle"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </AnimatePresence>
      <StyledTitleContainer variant={variant}>
        <OverflowingTextWithTooltip text={isEmpty ? t`Add Widget` : title} />
        {isDefined(widgetHeaderCount) && (
          <StyledCount>{formatNumber(widgetHeaderCount)}</StyledCount>
        )}
      </StyledTitleContainer>
      <StyledRightContainer>
        <WidgetCardHeaderActionsRenderer isInEditMode={isInEditMode} />
        {isDefined(forbiddenDisplay) && forbiddenDisplay}
        <AnimatePresence initial={false}>
          {!isResizing &&
            !isEmpty &&
            isInEditMode &&
            isDeletingWidgetEnabled &&
            onRemove &&
            widgetCardHovered && (
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
