import { CommandMenuBackButton } from '@/command-menu/components/CommandMenuBackButton';
import { CommandMenuPageInfo } from '@/command-menu/components/CommandMenuPageInfo';
import { CommandMenuTopBarInputFocusEffect } from '@/command-menu/components/CommandMenuTopBarInputFocusEffect';
import { CommandMenuTopBarRightCornerIcon } from '@/command-menu/components/CommandMenuTopBarRightCornerIcon';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT_MOBILE } from '@/command-menu/constants/CommandMenuSearchBarHeightMobile';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { COMMAND_MENU_SEARCH_INPUT_FOCUS_ID } from '@/command-menu/constants/CommandMenuSearchInputFocusId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuContextChips } from '@/command-menu/hooks/useCommandMenuContextChips';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledInputContainer = styled.div<{ isMobile: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  box-sizing: border-box;

  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.font.size.lg};
  height: ${({ isMobile }) =>
    isMobile
      ? COMMAND_MENU_SEARCH_BAR_HEIGHT_MOBILE
      : COMMAND_MENU_SEARCH_BAR_HEIGHT}px;
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

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const theme = useTheme();

  const { contextChips } = useCommandMenuContextChips();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleInputFocus = () => {
    pushFocusItemToFocusStack({
      focusId: COMMAND_MENU_SEARCH_INPUT_FOCUS_ID,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: COMMAND_MENU_SEARCH_INPUT_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleInputBlur = () => {
    removeFocusItemFromFocusStackById({
      focusId: COMMAND_MENU_SEARCH_INPUT_FOCUS_ID,
    });
  };

  const canGoBack = commandMenuNavigationStack.length > 1;

  const shouldShowCloseButton =
    !isMobile && commandMenuNavigationStack.length === 1;

  const shouldShowBackButton = canGoBack;

  const lastChip = contextChips.at(-1);

  return (
    <StyledInputContainer isMobile={isMobile}>
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
              <IconButton
                Icon={IconX}
                size="small"
                variant="tertiary"
                onClick={closeCommandMenu}
              />
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
              data-testid={COMMAND_MENU_SEARCH_INPUT_FOCUS_ID}
              ref={inputRef}
              value={commandMenuSearch}
              placeholder={t`Type anything...`}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <CommandMenuTopBarInputFocusEffect inputRef={inputRef} />
          </>
        )}
      </StyledContentContainer>
      <CommandMenuTopBarRightCornerIcon />
    </StyledInputContainer>
  );
};
