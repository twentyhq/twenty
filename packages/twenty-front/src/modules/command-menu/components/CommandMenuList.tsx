import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandGroupConfig } from '@/command-menu/components/CommandMenu';
import { CommandMenuDefaultSelectionEffect } from '@/command-menu/components/CommandMenuDefaultSelectionEffect';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { useResetPreviousCommandMenuContext } from '@/command-menu/hooks/useResetPreviousCommandMenuContext';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { MOBILE_VIEWPORT } from 'twenty-ui';

const MOBILE_NAVIGATION_BAR_HEIGHT = 64;

export type CommandMenuListProps = {
  commandGroups: CommandGroupConfig[];
  selectableItemIds: string[];
  children?: React.ReactNode;
  loading?: boolean;
  noResults?: boolean;
};

const StyledList = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
`;

const StyledInnerList = styled.div`
  max-height: calc(
    100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px -
      ${COMMAND_MENU_SEARCH_BAR_PADDING * 2}px -
      ${MOBILE_NAVIGATION_BAR_HEIGHT}px
  );
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    max-height: calc(
      100dvh - ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px -
        ${COMMAND_MENU_SEARCH_BAR_PADDING * 2}px
    );
  }
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 64px;
  justify-content: center;
  white-space: pre-wrap;
`;

export const CommandMenuList = ({
  commandGroups,
  selectableItemIds,
  children,
  loading = false,
  noResults = false,
}: CommandMenuListProps) => {
  const { onItemClick } = useCommandMenuOnItemClick();

  const commands = commandGroups.flatMap((group) => group.items ?? []);

  const { resetPreviousCommandMenuContext } =
    useResetPreviousCommandMenuContext();

  const setHasUserSelectedCommand = useSetRecoilState(
    hasUserSelectedCommandState,
  );

  return (
    <>
      <CommandMenuDefaultSelectionEffect
        selectableItemIds={selectableItemIds}
      />
      <StyledList>
        <ScrollWrapper
          contextProviderName="commandMenu"
          componentInstanceId={`scroll-wrapper-command-menu`}
        >
          <StyledInnerList>
            <SelectableList
              selectableListId="command-menu-list"
              hotkeyScope={AppHotkeyScope.CommandMenuOpen}
              selectableItemIdArray={selectableItemIds}
              onEnter={(itemId) => {
                if (itemId === RESET_CONTEXT_TO_SELECTION) {
                  resetPreviousCommandMenuContext();
                  return;
                }

                const command = commands.find((item) => item.id === itemId);

                if (isDefined(command)) {
                  const { to, onCommandClick, shouldCloseCommandMenuOnClick } =
                    command;

                  onItemClick({
                    shouldCloseCommandMenuOnClick,
                    onClick: onCommandClick,
                    to,
                  });
                }
              }}
              onSelect={() => {
                setHasUserSelectedCommand(true);
              }}
            >
              {children}
              {commandGroups.map(({ heading, items }) =>
                items?.length ? (
                  <CommandGroup heading={heading} key={heading}>
                    {items.map((item) => {
                      return (
                        <SelectableItem itemId={item.id} key={item.id}>
                          <CommandMenuItem
                            key={item.id}
                            id={item.id}
                            Icon={item.Icon}
                            label={item.label}
                            description={item.description}
                            to={item.to}
                            onClick={item.onCommandClick}
                            hotKeys={item.hotKeys}
                            shouldCloseCommandMenuOnClick={
                              item.shouldCloseCommandMenuOnClick
                            }
                          />
                        </SelectableItem>
                      );
                    })}
                  </CommandGroup>
                ) : null,
              )}
              {noResults && !loading && (
                <StyledEmpty>No results found</StyledEmpty>
              )}
            </SelectableList>
          </StyledInnerList>
        </ScrollWrapper>
      </StyledList>
    </>
  );
};
