import { CommandMenuItemComponent } from '@/command-menu-item/display/components/CommandMenuItemComponent';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledActionContainer = styled(motion.div)`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const PageHeaderCommandMenuButtons = () => {
  const { theme } = useContext(ThemeContext);
  const { commandMenuItems } = useContext(CommandMenuContext);
  const pinnedActions = commandMenuItems
    .filter((entry) => entry.isPinned)
    .toReversed();

  const actionsWithPositionForAnimation = pinnedActions.map(
    (action, index) => ({
      action,
      position: pinnedActions.length - index - 1,
    }),
  );

  return (
    <>
      {actionsWithPositionForAnimation.map(({ action, position }) => (
        <StyledActionContainer
          key={position}
          layout
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'unset', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{
            duration: theme.animation.duration.instant,
            ease: 'easeInOut',
          }}
        >
          <CommandMenuItemComponent action={action} />
        </StyledActionContainer>
      ))}
    </>
  );
};
