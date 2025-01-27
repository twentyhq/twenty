import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useMatchCommands } from '@/command-menu/hooks/useMatchCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { useIsMobile } from 'twenty-ui';

const MOBILE_NAVIGATION_BAR_HEIGHT = 64;

export type CommandMenuListProps = {
  commands: Command[];
  filtering: boolean;
  isLoading: boolean;
  pagination: { hasMore: boolean; pageSize: number; onLoadMore: () => void };
  // throttle: boolean;
};

const StyledList = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
`;

const StyledInnerList = styled.div<{ isMobile: boolean }>`
  max-height: ${({ isMobile }) =>
    isMobile
      ? `calc(100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px - ${
          COMMAND_MENU_SEARCH_BAR_PADDING * 2
        }px - ${MOBILE_NAVIGATION_BAR_HEIGHT}px)`
      : `calc(100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px - ${
          COMMAND_MENU_SEARCH_BAR_PADDING * 2
        }px)`};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

export const CommandMenuList = ({
  commands,
  filtering = true,
  isLoading = false,
  pagination,
}: CommandMenuListProps) => {
  const isMobile = useIsMobile();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const { matchCommands } = useMatchCommands({
    commandMenuSearch,
  });

  const filteredCommands = filtering ? matchCommands(commands) : commands;

  return (
    <StyledList>
      <ScrollWrapper
        contextProviderName="commandMenu"
        componentInstanceId={`scroll-wrapper-command-menu`}
      >
        <StyledInnerList isMobile={isMobile}>
          <SelectableList
            selectableListId="command-menu-list"
            hotkeyScope={AppHotkeyScope.CommandMenuOpen}
            selectableItemIdArray={filteredCommands.map(
              (command) => command.id,
            )}
          >
            {filteredCommands.map((command) => (
              <SelectableItem itemId={command.id} key={command.id}>
                <CommandMenuItem
                  id={command.id}
                  Icon={command.Icon}
                  label={command.label}
                  onClick={command.onCommandClick}
                  to={command.to}
                  shouldCloseCommandMenuOnClick={
                    command.shouldCloseCommandMenuOnClick
                  }
                />
              </SelectableItem>
            ))}
          </SelectableList>
        </StyledInnerList>
      </ScrollWrapper>
    </StyledList>
  );
};
