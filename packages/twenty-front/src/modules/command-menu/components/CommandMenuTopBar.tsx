import { CommandMenuContextRecordChip } from '@/command-menu/components/CommandMenuContextRecordChip';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { IconX, LightIconButton, isDefined, useIsMobile } from 'twenty-ui';

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;

  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  height: ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px;
  margin: 0;
  outline: none;
  position: relative;

  padding: 0 ${({ theme }) => theme.spacing(COMMAND_MENU_SEARCH_BAR_PADDING)};
  gap: ${({ theme }) => theme.spacing(1)};
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

const StyledCloseButtonContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
`;

type CommandMenuTopBarProps = {
  commandMenuSearch: string;
  setCommandMenuSearch: (search: string) => void;
};

export const CommandMenuTopBar = ({
  commandMenuSearch,
  setCommandMenuSearch,
}: CommandMenuTopBarProps) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommandMenuSearch(event.target.value);
  };

  const isMobile = useIsMobile();

  const { closeCommandMenu } = useCommandMenu();

  const contextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  return (
    <StyledInputContainer>
      {isDefined(contextStoreCurrentObjectMetadataId) && (
        <CommandMenuContextRecordChip
          objectMetadataItemId={contextStoreCurrentObjectMetadataId}
        />
      )}
      <StyledInput
        autoFocus
        value={commandMenuSearch}
        placeholder="Type anything"
        onChange={handleSearchChange}
      />
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
