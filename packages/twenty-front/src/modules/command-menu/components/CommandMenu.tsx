import { usePermissions } from '@/auth/contexts/PermissionContext';
import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuDefaultSelectionEffect } from '@/command-menu/components/CommandMenuDefaultSelectionEffect';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { useMatchingCommandMenuCommands } from '@/command-menu/hooks/useMatchingCommandMenuCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

const MOBILE_NAVIGATION_BAR_HEIGHT = 64;

type CommandGroupConfig = {
  heading: string;
  items?: Command[];
  show?: boolean;
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

const StyledEmpty = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 64px;
  justify-content: center;
  white-space: pre-wrap;
`;

export const CommandMenu = () => {
  const { onItemClick } = useCommandMenuOnItemClick();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const isMobile = useIsMobile();

  const { hasPermission } = usePermissions();

  const {
    isNoResults,
    isLoading,
    copilotCommands,
    matchingStandardActionRecordSelectionCommands,
    matchingWorkflowRunRecordSelectionCommands,
    matchingStandardActionGlobalCommands,
    matchingWorkflowRunGlobalCommands,
    matchingNavigateCommand,
    peopleCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    tasksCommands,
    customObjectCommands,
  } = useMatchingCommandMenuCommands({
    commandMenuSearch,
  });

  const selectableItems = copilotCommands
    .concat(matchingStandardActionRecordSelectionCommands)
    .concat(matchingWorkflowRunRecordSelectionCommands)
    .concat(matchingStandardActionGlobalCommands)
    .concat(matchingWorkflowRunGlobalCommands)
    .concat(matchingNavigateCommand)
    .concat(peopleCommands)
    .concat(companyCommands)
    .concat(opportunityCommands)
    .concat(noteCommands)
    .concat(tasksCommands)
    .concat(customObjectCommands)
    .filter(isDefined);

  const selectableItemIds = selectableItems.map((item) => item.id);

  const commandGroups: CommandGroupConfig[] = [
    {
      heading: 'Copilot',
      items: copilotCommands,
      show: true
    },
    {
      heading: 'Record Selection',
      items: matchingStandardActionRecordSelectionCommands,
      show: true
    },
    {
      heading: 'Workflow Record Selection',
      items: matchingWorkflowRunRecordSelectionCommands,
      show: true
    },
    {
      heading: 'View',
      items: matchingStandardActionGlobalCommands,
      show: true
    },
    {
      heading: 'Workflows',
      items: matchingWorkflowRunGlobalCommands,
      show: true
    },
    {
      heading: 'Navigate',
      items: matchingNavigateCommand,
      show: true
    },
    {
      heading: 'People',
      items: peopleCommands,
      show: hasPermission(['create', 'view', 'edit', 'delete'], 'people') ?? false
    },
    {
      heading: 'Companies',
      items: companyCommands,
      show: hasPermission(['create', 'view', 'edit', 'delete'], 'companies') ?? false
    },
    {
      heading: 'Opportunities',
      items: opportunityCommands,
      show: hasPermission(['create', 'view', 'edit', 'delete'], 'opportunities') ?? false
    },
    {
      heading: 'Notes',
      items: noteCommands,
      show: hasPermission(['create', 'view', 'edit', 'delete'], 'notes') ?? false
    },
    {
      heading: 'Tasks',
      items: tasksCommands,
      show: hasPermission(['create', 'view', 'edit', 'delete'], 'tasks') ?? false
    },
    {
      heading: 'Custom Objects',
      items: customObjectCommands,
      show: true
    },
  ];

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
          <StyledInnerList isMobile={isMobile}>
            <SelectableList
              selectableListId="command-menu-list"
              selectableItemIdArray={selectableItemIds}
              hotkeyScope={AppHotkeyScope.CommandMenu}
              onEnter={(itemId) => {
                const command = selectableItems.find(
                  (item) => item.id === itemId,
                );

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
            >
              {isNoResults && !isLoading && (
                <StyledEmpty>No results found</StyledEmpty>
              )}
              {commandGroups.filter((cmd) => cmd.show).map(({ heading, items }) =>
                items?.length ? (
                  <CommandGroup heading={heading} key={heading}>
                    {items.map((item) => {
                      let showCommandMenuItem = false;
                      if (item.id.startsWith("go-to-")) {
                        const objectNamePlural = item.id.split("go-to-")[1];
                        if(objectNamePlural === 'settings'){
                          showCommandMenuItem = true;
                        }
                       
                        if(hasPermission(['create', 'view', 'edit', 'delete'], objectNamePlural)){
                          showCommandMenuItem = true;
                        }

                        if(objectNamePlural === 'activities' && hasPermission(['create', 'view', 'edit', 'delete'], 'opportunities')){
                          showCommandMenuItem = true
                        }
                      } else if(hasPermission(['create', 'view', 'edit', 'delete'])){
                        showCommandMenuItem = true;
                      }
                      return (
                        <SelectableItem itemId={item.id} key={item.id}>
                          <CommandMenuItem
                            key={item.id}
                            id={item.id}
                            Icon={item.Icon}
                            label={item.label}
                            to={item.to}
                            onClick={item.onCommandClick}
                            firstHotKey={item.firstHotKey}
                            secondHotKey={item.secondHotKey}
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
            </SelectableList>
          </StyledInnerList>
        </ScrollWrapper>
      </StyledList>
    </>
  );
};
