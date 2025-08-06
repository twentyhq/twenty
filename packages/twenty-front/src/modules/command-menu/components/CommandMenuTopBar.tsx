import { CommandMenuContextChip } from '@/command-menu/components/CommandMenuContextChip';
import { CommandMenuContextChipGroups } from '@/command-menu/components/CommandMenuContextChipGroups';
import { CommandMenuContextChipGroupsWithRecordSelection } from '@/command-menu/components/CommandMenuContextChipGroupsWithRecordSelection';
import { CommandMenuTopBarInputFocusEffect } from '@/command-menu/components/CommandMenuTopBarInputFocusEffect';
import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuContextChips } from '@/command-menu/hooks/useCommandMenuContextChips';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol, useIsMobile } from 'twenty-ui/utilities';

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;

  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.font.size.lg};
  height: ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px;
  margin: 0;
  outline: none;
  position: relative;

  padding: 0 ${({ theme }) => theme.spacing(COMMAND_MENU_SEARCH_BAR_PADDING)};
  gap: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 0;
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
`;

const StyledCloseButtonWrapper = styled.div<{ isVisible: boolean }>`
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
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

  const { goBackFromCommandMenu } = useCommandMenuHistory();

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const theme = useTheme();

  const { contextChips } = useCommandMenuContextChips();

  const location = useLocation();
  const isButtonVisible =
    !location.pathname.startsWith('/objects/') &&
    !location.pathname.startsWith('/object/');

  const backButtonAnimationDuration =
    contextChips.length > 0 ? theme.animation.duration.instant : 0;

  return (
    <StyledInputContainer>
      <StyledContentContainer>
        <AnimatePresence>
          {commandMenuPage !== CommandMenuPages.Root && (
            <motion.div
              exit={{ opacity: 0, width: 0 }}
              transition={{
                duration: backButtonAnimationDuration,
              }}
            >
              <CommandMenuContextChip
                Icons={[<IconChevronLeft size={theme.icon.size.sm} />]}
                onClick={goBackFromCommandMenu}
                testId="command-menu-go-back-button"
                forceEmptyText={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {isDefined(contextStoreCurrentObjectMetadataItemId) &&
        commandMenuPage !== CommandMenuPages.SearchRecords ? (
          <CommandMenuContextChipGroupsWithRecordSelection
            contextChips={contextChips}
            objectMetadataItemId={contextStoreCurrentObjectMetadataItemId}
          />
        ) : (
          <CommandMenuContextChipGroups contextChips={contextChips} />
        )}
        {(commandMenuPage === CommandMenuPages.Root ||
          commandMenuPage === CommandMenuPages.SearchRecords) && (
          <>
            <StyledInput
              ref={inputRef}
              value={commandMenuSearch}
              placeholder={t`Type anything`}
              onChange={handleSearchChange}
            />
            <CommandMenuTopBarInputFocusEffect inputRef={inputRef} />
          </>
        )}
      </StyledContentContainer>
      {!isMobile && (
        <StyledCloseButtonWrapper isVisible={isButtonVisible}>
          <Button
            Icon={IconX}
            dataTestId="page-header-close-command-menu-button"
            size={'small'}
            variant="secondary"
            accent="default"
            hotkeys={[getOsControlSymbol(), 'K']}
            ariaLabel="Close command menu"
            onClick={closeCommandMenu}
          />
        </StyledCloseButtonWrapper>
      )}
    </StyledInputContainer>
  );
};
