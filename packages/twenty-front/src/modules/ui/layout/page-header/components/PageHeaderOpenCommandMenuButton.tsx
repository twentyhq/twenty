import {
  AnimatedButton,
  IconButton,
  IconDotsVertical,
  getOsControlSymbol,
  useIsMobile,
} from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledButtonWrapper = styled.div`
  z-index: 30;
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
          initial={{ pathLength: 0 }}
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
        animate={{
          scale: isCommandMenuOpened ? 0 : 1,
          opacity: isCommandMenuOpened ? 0 : 1,
        }}
        transition={{ duration: theme.animation.duration.fast }}
      />
    </svg>
  );
};

export const PageHeaderOpenCommandMenuButton = () => {
  const { toggleCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const isMobile = useIsMobile();

  const ariaLabel = isCommandMenuOpened
    ? t`Close command menu`
    : t`Open command menu`;

  const theme = useTheme();

  return (
    <StyledButtonWrapper>
      {isCommandMenuV2Enabled ? (
        <AnimatedButton
          animatedSvg={
            <AnimatedIcon isCommandMenuOpened={isCommandMenuOpened} />
          }
          className="page-header-command-menu-button"
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
      ) : (
        <IconButton
          Icon={IconDotsVertical}
          size="medium"
          dataTestId="more-showpage-button"
          accent="default"
          variant="secondary"
          onClick={toggleCommandMenu}
        />
      )}
    </StyledButtonWrapper>
  );
};
