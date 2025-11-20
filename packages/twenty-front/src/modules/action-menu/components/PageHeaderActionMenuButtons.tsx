import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useContext } from 'react';

const StyledActionContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PageHeaderActionMenuButtons = () => {
  const { actions } = useContext(ActionMenuContext);
  const theme = useTheme();

  const pinnedActions = actions.filter((entry) => entry.isPinned).toReversed();

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
          <ActionComponent action={action} />
        </StyledActionContainer>
      ))}
    </>
  );
};
