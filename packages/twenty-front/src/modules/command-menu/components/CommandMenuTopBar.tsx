import { CommandMenuContextChip } from '@/command-menu/components/CommandMenuContextChip';
import { CommandMenuContextChipGroups } from '@/command-menu/components/CommandMenuContextChipGroups';
import { CommandMenuContextChipGroupsWithRecordSelection } from '@/command-menu/components/CommandMenuContextChipGroupsWithRecordSelection';
import { CommandMenuTopBarInputFocusEffect } from '@/command-menu/components/CommandMenuTopBarInputFocusEffect';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  Button,
  IconChevronLeft,
  IconX,
  LightIconButton,
  getOsControlSymbol,
  useIsMobile,
} from 'twenty-ui';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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

const StyledCloseButtonContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
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

  const { closeCommandMenu, goBackFromCommandMenu } = useCommandMenu();

  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const theme = useTheme();

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const contextChips = useMemo(() => {
    return commandMenuNavigationStack
      .filter((page) => page.page !== CommandMenuPages.Root)
      .map((page) => {
        return {
          Icons: [<page.pageIcon size={theme.icon.size.sm} />],
          text: page.pageTitle,
        };
      });
  }, [commandMenuNavigationStack, theme.icon.size.sm]);

  return (
    <StyledInputContainer>
      <StyledContentContainer>
        {isCommandMenuV2Enabled && (
          <>
            {commandMenuPage !== CommandMenuPages.Root && (
              <CommandMenuContextChip
                Icons={[<IconChevronLeft size={theme.icon.size.sm} />]}
                onClick={() => {
                  goBackFromCommandMenu();
                }}
                testId="command-menu-go-back-button"
              />
            )}
            {isDefined(contextStoreCurrentObjectMetadataId) &&
            commandMenuPage !== CommandMenuPages.SearchRecords ? (
              <CommandMenuContextChipGroupsWithRecordSelection
                contextChips={contextChips}
                objectMetadataItemId={contextStoreCurrentObjectMetadataId}
              />
            ) : (
              <CommandMenuContextChipGroups contextChips={contextChips} />
            )}
          </>
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
        <>
          {isCommandMenuV2Enabled ? (
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
          ) : (
            <StyledCloseButtonContainer>
              <LightIconButton
                accent={'tertiary'}
                size={'medium'}
                Icon={IconX}
                onClick={closeCommandMenu}
              />
            </StyledCloseButtonContainer>
          )}
        </>
      )}
    </StyledInputContainer>
  );
};
