import { CommandMenuBackButton } from '@/command-menu/components/CommandMenuBackButton';
import { CommandMenuPageInfo } from '@/command-menu/components/CommandMenuPageInfo';
import { CommandMenuTopBarInputFocusEffect } from '@/command-menu/components/CommandMenuTopBarInputFocusEffect';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuContextChips } from '@/command-menu/hooks/useCommandMenuContextChips';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconSparkles, IconX } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  box-sizing: border-box;

  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.font.size.lg};
  height: ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px;
  margin: 0;
  outline: none;
  position: relative;
  overflow: hidden;

  padding: 0 ${({ theme }) => theme.spacing(COMMAND_MENU_SEARCH_BAR_PADDING)};
  gap: ${({ theme }) => theme.spacing(4)};
  flex-shrink: 0;
  justify-content: space-between;
`;

const StyledInput = styled.input`
  border: none;
  border-radius: 0;
  background-color: transparent;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: 0;
  outline: none;
  height: 24px;
  padding: 0;
  flex: 1;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const StyledContentContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
  overflow: hidden;
`;

const StyledNavigationIcon = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledIconSparkles = styled(IconSparkles)`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
`;

export const CommandMenuTopBar = () => {
  const [commandMenuSearch, setCommandMenuSearch] = useRecoilState(
    commandMenuSearchState,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useLingui();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommandMenuSearch(event.target.value);
  };

  const isMobile = useIsMobile();

  const { closeCommandMenu } = useCommandMenu();

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const theme = useTheme();

  const { contextChips } = useCommandMenuContextChips();

  const canGoBack = commandMenuNavigationStack.length > 1;

  const shouldShowCloseButton = commandMenuNavigationStack.length === 1;

  const shouldShowBackButton = canGoBack;

  const lastChip = contextChips.at(-1);

  return (
    <StyledInputContainer>
      <StyledContentContainer>
        <AnimatePresence>
          {shouldShowBackButton && (
            <motion.div
              exit={{ opacity: 0, width: 0 }}
              transition={{
                duration: theme.animation.duration.instant,
              }}
            >
              <CommandMenuBackButton />
            </motion.div>
          )}
          {shouldShowCloseButton && (
            <motion.div
              exit={{ opacity: 0, width: 0 }}
              transition={{
                duration: theme.animation.duration.instant,
              }}
            >
              <StyledNavigationIcon onClick={closeCommandMenu}>
                <IconX size={theme.icon.size.md} />
              </StyledNavigationIcon>
            </motion.div>
          )}
        </AnimatePresence>
        {lastChip &&
          commandMenuPage !== CommandMenuPages.Root &&
          commandMenuPage !== CommandMenuPages.SearchRecords && (
            <CommandMenuPageInfo pageChip={lastChip} />
          )}
        {(commandMenuPage === CommandMenuPages.Root ||
          commandMenuPage === CommandMenuPages.SearchRecords) && (
          <>
            <StyledInput
              data-testid="command-menu-search-input"
              ref={inputRef}
              value={commandMenuSearch}
              placeholder={t`Type anything...`}
              onChange={handleSearchChange}
            />
            <CommandMenuTopBarInputFocusEffect inputRef={inputRef} />
          </>
        )}
      </StyledContentContainer>
      {!isMobile &&
        isAiEnabled &&
        commandMenuPage !== CommandMenuPages.AskAI && (
          <StyledIconSparkles
            onClick={() => openAskAIPage()}
            size={theme.icon.size.md}
          />
        )}
    </StyledInputContainer>
  );
};
