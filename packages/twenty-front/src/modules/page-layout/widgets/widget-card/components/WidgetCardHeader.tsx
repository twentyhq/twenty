import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { WidgetActionRenderer } from '@/page-layout/widgets/components/WidgetActionRenderer';
import { widgetCardHoveredComponentFamilyState } from '@/page-layout/widgets/states/widgetCardHoveredComponentFamilyState';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { type WidgetAction } from '@/page-layout/widgets/types/WidgetAction';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode, useContext } from 'react';
import { IconTrash } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { IconButton, LightIconButton } from 'twenty-ui/input';

import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';
import { WidgetGrip } from '@/page-layout/widgets/widget-card/components/WidgetGrip';
import { AnimatePresence, motion } from 'framer-motion';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
export type WidgetCardHeaderProps = {
  variant: WidgetCardVariant;
  widgetId: string;
  isInEditMode: boolean;
  isEmpty?: boolean;
  title: string;
  onRemove?: (e?: React.MouseEvent) => void;
  forbiddenDisplay?: ReactNode;
  actions?: WidgetAction[];
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

const StyledActionsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
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
  actions,
  className,
}: WidgetCardHeaderProps) => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();
  const widgetCardHovered = useAtomComponentFamilyStateValue(
    widgetCardHoveredComponentFamilyState,
    widgetId,
  );

  const widgetHeaderInfo = useAtomComponentFamilyStateValue(
    widgetHeaderInfoComponentFamilyState,
    widgetId,
  );

  const count = widgetHeaderInfo?.count;
  const primaryAction = widgetHeaderInfo?.primaryAction;

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
        {isDefined(count) && <StyledCount>{formatNumber(count)}</StyledCount>}
      </StyledTitleContainer>
      <StyledRightContainer>
        {!isInEditMode && isDefined(primaryAction) && (
          <LightIconButton
            Icon={primaryAction.Icon}
            aria-label={primaryAction.label}
            title={primaryAction.label}
            accent="tertiary"
            size="small"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
          />
        )}
        {isNonEmptyArray(actions) && (
          <StyledActionsContainer>
            {actions.map((action) => (
              <WidgetActionRenderer key={action.id} action={action} />
            ))}
          </StyledActionsContainer>
        )}
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
