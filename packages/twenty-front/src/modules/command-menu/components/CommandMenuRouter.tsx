import { CommandMenuContainer } from '@/command-menu/components/CommandMenuContainer';
import { CommandMenuTopBar } from '@/command-menu/components/CommandMenuTopBar';
import { COMMAND_MENU_PAGES_CONFIG } from '@/command-menu/constants/CommandMenuPagesConfig';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

const StyledCommandMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const CommandMenuRouter = () => {
  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const commandMenuPageComponent = isDefined(commandMenuPage) ? (
    COMMAND_MENU_PAGES_CONFIG.get(commandMenuPage)
  ) : (
    <></>
  );

  const theme = useTheme();

  return (
    <CommandMenuContainer>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: theme.animation.duration.instant,
          delay: 0.1,
        }}
      >
        <CommandMenuTopBar />
      </motion.div>
      <StyledCommandMenuContent>
        {commandMenuPageComponent}
      </StyledCommandMenuContent>
    </CommandMenuContainer>
  );
};
