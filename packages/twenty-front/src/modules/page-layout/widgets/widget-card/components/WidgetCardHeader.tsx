import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { WidgetCardHeaderActionsRenderer } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionsRenderer';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useContext } from 'react';
import { IconTrash } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';

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
  hasAccess?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
  forbiddenDisplay?: ReactNode;
  className?: string;
  isResizing?: boolean;
};

const StyledWidgetCardHeader = styled.div<{ shouldInset: boolean }>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${({ shouldInset }) =>
    shouldInset
      ? `calc(${themeCssVariables.spacing[6]} + var(--widget-card-title-padding-top))`
      : themeCssVariables.spacing[6]};
  padding: ${({ shouldInset }) =>
    shouldInset
      ? `var(--widget-card-title-padding-top) var(--widget-card-padding-inline) 0`
      : '0'};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
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
  variant,
  widgetId,
  isEmpty = false,
  isInEditMode = false,
  hasAccess = true,
  isResizing = false,
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

  const shouldInset = variant === 'flush';
  return (
    <StyledWidgetCardHeader className={className} shouldInset={shouldInset}>
      <AnimatePresence initial={false}>
        {!isEmpty && isInEditMode && <WidgetGrip className="drag-handle" />}
      </AnimatePresence>
      <StyledTitleContainer>
        <OverflowingTextWithTooltip text={isEmpty ? t`Add Widget` : title} />
        {isDefined(widgetHeaderCount) && (
          <StyledCount>{formatNumber(widgetHeaderCount)}</StyledCount>
        )}
      </StyledTitleContainer>
      <StyledRightContainer>
        {hasAccess && <WidgetCardHeaderActionsRenderer />}
        {isDefined(forbiddenDisplay) && forbiddenDisplay}
        <AnimatePresence initial={false}>
          {!isResizing &&
            !isEmpty &&
            isInEditMode &&
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
