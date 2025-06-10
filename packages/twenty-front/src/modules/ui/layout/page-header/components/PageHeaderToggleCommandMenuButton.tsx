import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PAGE_HEADER_COMMAND_MENU_BUTTON_CLICK_OUTSIDE_ID } from '@/ui/layout/page-header/constants/PageHeaderCommandMenuButtonClickOutsideId';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/display';
import { AnimatedButton } from 'twenty-ui/input';
import { getOsControlSymbol, useIsMobile } from 'twenty-ui/utilities';

const StyledButtonWrapper = styled.div`
  z-index: ${RootStackingContextZIndices.CommandMenuButton};
`;

const StyledTooltipWrapper = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
`;

const xPaths = {
  topLeft: `M12 12 L6 6`,
  topRight: `M12 12 L18 6`,
  bottomLeft: `M12 12 L6 18`,
  bottomRight: `M12 12 L18 18`,
};

const AnimatedIcon = ({
  isCommandMenuOpened,
}: {
  isCommandMenuOpened: boolean;
}) => {
  const theme = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={theme.icon.size.sm}
      height={theme.icon.size.sm}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={theme.icon.stroke.md}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      {/* Center dot */}
      <motion.circle
        cx={12}
        cy={12}
        r="1"
        initial={{ opacity: 0 }}
        animate={{
          scale: isCommandMenuOpened ? 0 : 1,
          opacity: isCommandMenuOpened ? 0 : 1,
        }}
        transition={{ duration: theme.animation.duration.fast }}
      />

      {/* X lines expanding from center */}
      {Object.values(xPaths).map((path, index) => (
        <motion.path
          key={index}
          d={path}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: isCommandMenuOpened ? 1 : 0,
            opacity: isCommandMenuOpened ? 1 : 0,
          }}
          transition={{
            duration: theme.animation.duration.fast,
            ease: 'easeInOut',
            delay: isCommandMenuOpened ? 0.1 : 0,
          }}
        />
      ))}

      {/* Top dot */}
      <motion.circle
        cx="12"
        cy="5"
        r="1"
        initial={{ opacity: 0 }}
        animate={{
          scale: isCommandMenuOpened ? 0 : 1,
          opacity: isCommandMenuOpened ? 0 : 1,
        }}
        transition={{ duration: theme.animation.duration.fast }}
      />

      {/* Bottom dot */}
      <motion.circle
        cx="12"
        cy="19"
        r="1"
        initial={{ opacity: 0 }}
        animate={{
          scale: isCommandMenuOpened ? 0 : 1,
          opacity: isCommandMenuOpened ? 0 : 1,
        }}
        transition={{ duration: theme.animation.duration.fast }}
      />
    </svg>
  );
};

export const PageHeaderToggleCommandMenuButton = () => {
  const { toggleCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  const isMobile = useIsMobile();

  const ariaLabel = isCommandMenuOpened
    ? t`Close command menu`
    : t`Open command menu`;

  const theme = useTheme();

  return (
    <StyledButtonWrapper>
      <div id="toggle-command-menu-button">
        <AnimatedButton
          animatedSvg={
            <AnimatedIcon isCommandMenuOpened={isCommandMenuOpened} />
          }
          dataClickOutsideId={PAGE_HEADER_COMMAND_MENU_BUTTON_CLICK_OUTSIDE_ID}
          dataTestId="page-header-command-menu-button"
          size={isMobile ? 'medium' : 'small'}
          variant="secondary"
          accent="default"
          hotkeys={[getOsControlSymbol(), 'K']}
          ariaLabel={ariaLabel}
          onClick={toggleCommandMenu}
          animate={{
            rotate: isCommandMenuOpened ? 90 : 0,
          }}
          transition={{
            duration: theme.animation.duration.normal,
            ease: 'easeInOut',
          }}
        />
      </div>

      <StyledTooltipWrapper>
        <AppTooltip
          anchorSelect="#toggle-command-menu-button"
          content={i18n._(ariaLabel)}
          delay={TooltipDelay.longDelay}
          place={TooltipPosition.Bottom}
          offset={5}
          noArrow
        />
      </StyledTooltipWrapper>
    </StyledButtonWrapper>
  );
};
