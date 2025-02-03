import { CommandMenuContextChip } from '@/command-menu/components/CommandMenuContextChip';
import { CommandMenuContextRecordChip } from '@/command-menu/components/CommandMenuContextRecordChip';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageTitle';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { IconX, LightIconButton, useIsMobile } from 'twenty-ui';

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

  const { t } = useLingui();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommandMenuSearch(event.target.value);
  };

  const isMobile = useIsMobile();

  const { closeCommandMenu } = useCommandMenu();

  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const { title, Icon } = useRecoilValue(commandMenuPageInfoState);

  const theme = useTheme();

  return (
    <StyledInputContainer>
      <StyledContentContainer>
        {commandMenuPage !== CommandMenuPages.SearchRecords &&
          isDefined(contextStoreCurrentObjectMetadataId) && (
            <CommandMenuContextRecordChip
              objectMetadataItemId={contextStoreCurrentObjectMetadataId}
            />
          )}
        {isDefined(Icon) && (
          <CommandMenuContextChip
            Icons={[<Icon size={theme.icon.size.sm} />]}
            text={title}
          />
        )}

        {(commandMenuPage === CommandMenuPages.Root ||
          commandMenuPage === CommandMenuPages.SearchRecords) && (
          <StyledInput
            autoFocus
            value={commandMenuSearch}
            placeholder={t`Type anything`}
            onChange={handleSearchChange}
          />
        )}
      </StyledContentContainer>
      {!isMobile && (
        <StyledCloseButtonContainer>
          <LightIconButton
            accent={'tertiary'}
            size={'medium'}
            Icon={IconX}
            onClick={closeCommandMenu}
          />
        </StyledCloseButtonContainer>
      )}
    </StyledInputContainer>
  );
};
