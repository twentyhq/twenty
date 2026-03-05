import { SidePanelBackButton } from '@/side-panel/components/SidePanelBackButton';
import { SidePanelPageInfo } from '@/side-panel/components/SidePanelPageInfo';
import { SidePanelTopBarInputFocusEffect } from '@/side-panel/components/SidePanelTopBarInputFocusEffect';
import { SidePanelTopBarRightCornerIcon } from '@/side-panel/components/SidePanelTopBarRightCornerIcon';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT_MOBILE } from '@/command-menu/constants/CommandMenuSearchBarHeightMobile';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useSidePanelContextChips } from '@/side-panel/hooks/useSidePanelContextChips';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useRef } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledInputContainer = styled.div<{ isMobile: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: none;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 0;
  box-sizing: border-box;

  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.lg};
  height: ${({ isMobile }) =>
    isMobile
      ? COMMAND_MENU_SEARCH_BAR_HEIGHT_MOBILE
      : COMMAND_MENU_SEARCH_BAR_HEIGHT}px;
  margin: 0;
  outline: none;
  position: relative;
  overflow: hidden;

  padding: 0 ${themeCssVariables.spacing[2]};
  gap: ${themeCssVariables.spacing[4]};
  flex-shrink: 0;
  justify-content: space-between;
`;

const StyledInput = styled.input`
  border: none;
  border-radius: 0;
  background-color: transparent;
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
  outline: none;
  height: 24px;
  padding: 0;
  flex: 1;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
`;

const StyledContentContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

export const SidePanelTopBar = () => {
  const [sidePanelSearch, setSidePanelSearch] = useAtomState(
    sidePanelSearchState,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useLingui();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSidePanelSearch(event.target.value);
  };

  const isMobile = useIsMobile();

  const { closeCommandMenu } = useCommandMenu();

  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );

  const { theme } = useContext(ThemeContext);

  const { contextChips } = useSidePanelContextChips();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleInputFocus = () => {
    pushFocusItemToFocusStack({
      focusId: SIDE_PANEL_FOCUS_ID,
      component: {
        type: FocusComponentType.TEXT_INPUT,
        instanceId: SIDE_PANEL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleInputBlur = () => {
    removeFocusItemFromFocusStackById({
      focusId: SIDE_PANEL_FOCUS_ID,
    });
  };

  const canGoBack = sidePanelNavigationStack.length > 1;

  const shouldShowCloseButton =
    !isMobile && sidePanelNavigationStack.length === 1;

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
              <SidePanelBackButton />
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
          sidePanelPage !== SidePanelPages.Root &&
          sidePanelPage !== SidePanelPages.SearchRecords && (
            <SidePanelPageInfo pageChip={lastChip} />
          )}
        {(sidePanelPage === SidePanelPages.Root ||
          sidePanelPage === SidePanelPages.SearchRecords) && (
          <>
            <StyledInput
              data-testid={SIDE_PANEL_FOCUS_ID}
              ref={inputRef}
              value={sidePanelSearch}
              placeholder={t`Type anything...`}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <SidePanelTopBarInputFocusEffect inputRef={inputRef} />
          </>
        )}
      </StyledContentContainer>
      <SidePanelTopBarRightCornerIcon />
    </StyledInputContainer>
  );
};
