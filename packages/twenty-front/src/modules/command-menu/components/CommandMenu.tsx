import { useOpenCopilotRightDrawer } from '@/activities/copilot/right-drawer/hooks/useOpenCopilotRightDrawer';
import { copilotQueryState } from '@/activities/copilot/right-drawer/states/copilotQueryState';
import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuCommandsState } from '@/command-menu/states/commandMenuCommandsState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { Command, CommandType } from '@/command-menu/types/Command';
import { Company } from '@/companies/types/Company';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap } from '@/object-record/relation-picker/hooks/useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { useMemo, useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import {
  Avatar,
  IconCheckbox,
  IconComponent,
  IconNotes,
  IconSparkles,
  IconX,
  LightIconButton,
  isDefined,
} from 'twenty-ui';
import { useDebounce } from 'use-debounce';
import { getLogoUrlFromDomainName } from '~/utils';
import { capitalize } from '~/utils/string/capitalize';

const SEARCH_BAR_HEIGHT = 56;
const SEARCH_BAR_PADDING = 3;
const MOBILE_NAVIGATION_BAR_HEIGHT = 64;

type CommandGroupConfig = {
  heading: string;
  items?: any[];
  renderItem: (item: any) => {
    id: string;
    Icon?: IconComponent;
    label: string;
    to?: string;
    onClick?: () => void;
    key?: string;
  };
};

const StyledCommandMenu = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  height: 100%;
  overflow: hidden;
  padding: 0;
  position: fixed;
  right: 0%;
  top: 0%;
  width: ${() => (useIsMobile() ? '100%' : '500px')};
  z-index: 1000;
`;

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;

  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  height: ${SEARCH_BAR_HEIGHT}px;
  margin: 0;
  outline: none;
  position: relative;

  padding: 0 ${({ theme }) => theme.spacing(SEARCH_BAR_PADDING)};
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
  width: ${({ theme }) => `calc(100% - ${theme.spacing(8)})`};

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

const StyledList = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
`;

const StyledInnerList = styled.div<{ isMobile: boolean }>`
  max-height: ${({ isMobile }) =>
    isMobile
      ? `calc(100dvh - ${SEARCH_BAR_HEIGHT}px - ${
          SEARCH_BAR_PADDING * 2
        }px - ${MOBILE_NAVIGATION_BAR_HEIGHT}px)`
      : `calc(100dvh - ${SEARCH_BAR_HEIGHT}px - ${SEARCH_BAR_PADDING * 2}px)`};
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
  const { toggleCommandMenu, onItemClick, closeCommandMenu } = useCommandMenu();
  const commandMenuRef = useRef<HTMLDivElement>(null);
  const openActivityRightDrawer = useOpenActivityRightDrawer({
    objectNameSingular: CoreObjectNameSingular.Note,
  });
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const [commandMenuSearch, setCommandMenuSearch] = useRecoilState(
    commandMenuSearchState,
  );
  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300); // 200ms - 500ms
  const commandMenuCommands = useRecoilValue(commandMenuCommandsState);
  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommandMenuSearch(event.target.value);
  };

  const isMobile = useIsMobile();

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      closeKeyboardShortcutMenu();
      toggleCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [toggleCommandMenu],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeCommandMenu();
    },
    AppHotkeyScope.CommandMenuOpen,
    [closeCommandMenu],
  );

  const {
    matchesSearchFilterObjectRecordsQueryResult,
    matchesSearchFilterObjectRecordsLoading: loading,
  } = useMultiObjectSearch({
    excludedObjects: [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note],
    searchFilterValue: deferredCommandMenuSearch ?? undefined,
    limit: 3,
  });

  const { objectRecordsMap: matchesSearchFilterObjectRecords } =
    useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap({
      multiObjectRecordsQueryResult:
        matchesSearchFilterObjectRecordsQueryResult,
    });

  const { loading: isNotesLoading, records: notes } = useFindManyRecords<Note>({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Note,
    filter: deferredCommandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${deferredCommandMenuSearch}%` } },
          { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: 3,
  });

  const { loading: isTasksLoading, records: tasks } = useFindManyRecords<Task>({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Task,
    filter: deferredCommandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${deferredCommandMenuSearch}%` } },
          { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: 3,
  });

  const people = matchesSearchFilterObjectRecords.people?.map(
    (people) => people.record,
  );
  const companies = matchesSearchFilterObjectRecords.companies?.map(
    (companies) => companies.record,
  );
  const opportunities = matchesSearchFilterObjectRecords.opportunities?.map(
    (opportunities) => opportunities.record,
  );

  const customObjectRecordsMap = useMemo(() => {
    return Object.fromEntries(
      Object.entries(matchesSearchFilterObjectRecords).filter(
        ([namePlural, records]) =>
          ![
            CoreObjectNamePlural.Person,
            CoreObjectNamePlural.Opportunity,
            CoreObjectNamePlural.Company,
          ].includes(namePlural as CoreObjectNamePlural) && !isEmpty(records),
      ),
    );
  }, [matchesSearchFilterObjectRecords]);

  const peopleCommands = useMemo(
    () =>
      people?.map(({ id, name: { firstName, lastName } }) => ({
        id,
        label: `${firstName} ${lastName}`,
        to: `object/person/${id}`,
      })),
    [people],
  );

  const companyCommands = useMemo(
    () =>
      companies?.map(({ id, name }) => ({
        id,
        label: name ?? '',
        to: `object/company/${id}`,
      })),
    [companies],
  );

  const opportunityCommands = useMemo(
    () =>
      opportunities?.map(({ id, name }) => ({
        id,
        label: name ?? '',
        to: `object/opportunity/${id}`,
      })),
    [opportunities],
  );

  const noteCommands = useMemo(
    () =>
      notes?.map((note) => ({
        id: note.id,
        label: note.title ?? '',
        to: '',
        onCommandClick: () => openActivityRightDrawer(note.id),
      })),
    [notes, openActivityRightDrawer],
  );

  const tasksCommands = useMemo(
    () =>
      tasks?.map((task) => ({
        id: task.id,
        label: task.title ?? '',
        to: '',
        onCommandClick: () => openActivityRightDrawer(task.id),
      })),
    [tasks, openActivityRightDrawer],
  );

  const customObjectCommands = useMemo(() => {
    const customObjectCommandsArray: Command[] = [];
    Object.values(customObjectRecordsMap).forEach((objectRecords) => {
      customObjectCommandsArray.push(
        ...objectRecords.map((objectRecord) => ({
          id: objectRecord.record.id,
          label: objectRecord.recordIdentifier.name,
          to: `object/${objectRecord.objectMetadataItem.nameSingular}/${objectRecord.record.id}`,
        })),
      );
    });

    return customObjectCommandsArray;
  }, [customObjectRecordsMap]);

  const otherCommands = useMemo(() => {
    const commandsArray: Command[] = [];
    if (peopleCommands?.length > 0) {
      commandsArray.push(...(peopleCommands as Command[]));
    }
    if (companyCommands?.length > 0) {
      commandsArray.push(...(companyCommands as Command[]));
    }
    if (opportunityCommands?.length > 0) {
      commandsArray.push(...(opportunityCommands as Command[]));
    }
    if (noteCommands?.length > 0) {
      commandsArray.push(...(noteCommands as Command[]));
    }
    if (tasksCommands?.length > 0) {
      commandsArray.push(...(tasksCommands as Command[]));
    }
    if (customObjectCommands?.length > 0) {
      commandsArray.push(...(customObjectCommands as Command[]));
    }
    return commandsArray;
  }, [
    peopleCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    customObjectCommands,
    tasksCommands,
  ]);

  const checkInShortcuts = (cmd: Command, search: string) => {
    return (cmd.firstHotKey + (cmd.secondHotKey ?? ''))
      .toLowerCase()
      .includes(search.toLowerCase());
  };

  const checkInLabels = (cmd: Command, search: string) => {
    if (isNonEmptyString(cmd.label)) {
      return cmd.label.toLowerCase().includes(search.toLowerCase());
    }
    return false;
  };

  const matchingNavigateCommand = commandMenuCommands.filter(
    (cmd) =>
      (deferredCommandMenuSearch.length > 0
        ? checkInShortcuts(cmd, deferredCommandMenuSearch) ||
          checkInLabels(cmd, deferredCommandMenuSearch)
        : true) && cmd.type === CommandType.Navigate,
  );

  const matchingCreateCommand = commandMenuCommands.filter(
    (cmd) =>
      (deferredCommandMenuSearch.length > 0
        ? checkInShortcuts(cmd, deferredCommandMenuSearch) ||
          checkInLabels(cmd, deferredCommandMenuSearch)
        : true) && cmd.type === CommandType.Create,
  );

  const matchingStandardActionCommands = commandMenuCommands.filter(
    (cmd) =>
      (deferredCommandMenuSearch.length > 0
        ? checkInShortcuts(cmd, deferredCommandMenuSearch) ||
          checkInLabels(cmd, deferredCommandMenuSearch)
        : true) && cmd.type === CommandType.StandardAction,
  );

  const matchingWorkflowRunCommands = commandMenuCommands.filter(
    (cmd) =>
      (deferredCommandMenuSearch.length > 0
        ? checkInShortcuts(cmd, deferredCommandMenuSearch) ||
          checkInLabels(cmd, deferredCommandMenuSearch)
        : true) && cmd.type === CommandType.WorkflowRun,
  );

  useListenClickOutside({
    refs: [commandMenuRef],
    callback: closeCommandMenu,
  });

  const isCopilotEnabled = useIsFeatureEnabled('IS_COPILOT_ENABLED');
  const setCopilotQuery = useSetRecoilState(copilotQueryState);
  const openCopilotRightDrawer = useOpenCopilotRightDrawer();

  const copilotCommand: Command = {
    id: 'copilot',
    to: '', // TODO
    Icon: IconSparkles,
    label: 'Open Copilot',
    type: CommandType.Navigate,
    onCommandClick: () => {
      setCopilotQuery(deferredCommandMenuSearch);
      openCopilotRightDrawer();
    },
  };

  const copilotCommands: Command[] = isCopilotEnabled ? [copilotCommand] : [];

  const selectableItemIds = copilotCommands
    .map((cmd) => cmd.id)
    .concat(matchingStandardActionCommands.map((cmd) => cmd.id))
    .concat(matchingWorkflowRunCommands.map((cmd) => cmd.id))
    .concat(matchingCreateCommand.map((cmd) => cmd.id))
    .concat(matchingNavigateCommand.map((cmd) => cmd.id))
    .concat(people?.map((person) => person.id))
    .concat(companies?.map((company) => company.id))
    .concat(opportunities?.map((opportunity) => opportunity.id))
    .concat(notes?.map((note) => note.id))
    .concat(tasks?.map((task) => task.id))
    .concat(
      Object.values(customObjectRecordsMap)
        ?.map((objectRecords) =>
          objectRecords.map((objectRecord) => objectRecord.record.id),
        )
        .flat() ?? [],
    );

  const isNoResults =
    !matchingStandardActionCommands.length &&
    !matchingWorkflowRunCommands.length &&
    !matchingCreateCommand.length &&
    !matchingNavigateCommand.length &&
    !people?.length &&
    !companies?.length &&
    !notes?.length &&
    !tasks?.length &&
    !opportunities?.length &&
    isEmpty(customObjectRecordsMap);

  const isLoading = loading || isNotesLoading || isTasksLoading;

  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const commandGroups: CommandGroupConfig[] = [
    {
      heading: 'Navigate',
      items: matchingNavigateCommand,
      renderItem: (command) => ({
        id: command.id,
        Icon: command.Icon,
        label: command.label,
        to: command.to,
        onClick: command.onCommandClick,
      }),
    },
    {
      heading: 'Other',
      items: matchingCreateCommand,
      renderItem: (command) => ({
        id: command.id,
        Icon: command.Icon,
        label: command.label,
        to: command.to,
        onClick: command.onCommandClick,
      }),
    },
    {
      heading: 'People',
      items: people,
      renderItem: (person) => ({
        id: person.id,
        label: `${person.name.firstName} ${person.name.lastName}`,
        to: `object/person/${person.id}`,
        Icon: () => (
          <Avatar
            type="rounded"
            avatarUrl={null}
            placeholderColorSeed={person.id}
            placeholder={`${person.name.firstName} ${person.name.lastName}`}
          />
        ),
      }),
    },
    {
      heading: 'Companies',
      items: companies,
      renderItem: (company) => ({
        id: company.id,
        label: company.name,
        to: `object/company/${company.id}`,
        Icon: () => (
          <Avatar
            placeholderColorSeed={company.id}
            placeholder={company.name}
            avatarUrl={getLogoUrlFromDomainName(
              getCompanyDomainName(company as Company),
            )}
          />
        ),
      }),
    },
    {
      heading: 'Opportunities',
      items: opportunities,
      renderItem: (opportunity) => ({
        id: opportunity.id,
        label: opportunity.name ?? '',
        to: `object/opportunity/${opportunity.id}`,
        Icon: () => (
          <Avatar
            type="rounded"
            avatarUrl={null}
            placeholderColorSeed={opportunity.id}
            placeholder={opportunity.name ?? ''}
          />
        ),
      }),
    },
    {
      heading: 'Notes',
      items: notes,
      renderItem: (note) => ({
        id: note.id,
        Icon: IconNotes,
        label: note.title ?? '',
        onClick: () => openActivityRightDrawer(note.id),
      }),
    },
    {
      heading: 'Tasks',
      items: tasks,
      renderItem: (task) => ({
        id: task.id,
        Icon: IconCheckbox,
        label: task.title ?? '',
        onClick: () => openActivityRightDrawer(task.id),
      }),
    },
    ...Object.entries(customObjectRecordsMap).map(
      ([customObjectNamePlural, objectRecords]): CommandGroupConfig => ({
        heading: capitalize(customObjectNamePlural),
        items: objectRecords,
        renderItem: (objectRecord) => ({
          key: objectRecord.record.id,
          id: objectRecord.record.id,
          label: objectRecord.recordIdentifier.name,
          to: `object/${objectRecord.objectMetadataItem.nameSingular}/${objectRecord.record.id}`,
          Icon: () => (
            <Avatar
              type="rounded"
              avatarUrl={null}
              placeholderColorSeed={objectRecord.id}
              placeholder={objectRecord.recordIdentifier.name ?? ''}
            />
          ),
        }),
      }),
    ),
  ];

  return (
    <>
      {isCommandMenuOpened && (
        <StyledCommandMenu ref={commandMenuRef} className="command-menu">
          <StyledInputContainer>
            <StyledInput
              autoFocus
              value={commandMenuSearch}
              placeholder="Search"
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
          <StyledList>
            <ScrollWrapper contextProviderName="commandMenu">
              <StyledInnerList isMobile={isMobile}>
                <SelectableList
                  selectableListId="command-menu-list"
                  selectableItemIdArray={selectableItemIds}
                  hotkeyScope={AppHotkeyScope.CommandMenu}
                  onEnter={(itemId) => {
                    const command = [
                      ...copilotCommands,
                      ...commandMenuCommands,
                      ...otherCommands,
                    ].find((cmd) => cmd.id === itemId);

                    if (isDefined(command)) {
                      const { to, onCommandClick } = command;
                      onItemClick(onCommandClick, to);
                    }
                  }}
                >
                  {isNoResults && !isLoading && (
                    <StyledEmpty>No results found</StyledEmpty>
                  )}
                  {isCopilotEnabled && (
                    <CommandGroup heading="Copilot">
                      <SelectableItem itemId={copilotCommand.id}>
                        <CommandMenuItem
                          id={copilotCommand.id}
                          Icon={copilotCommand.Icon}
                          label={`${copilotCommand.label} ${
                            deferredCommandMenuSearch.length > 2
                              ? `"${deferredCommandMenuSearch}"`
                              : ''
                          }`}
                          onClick={copilotCommand.onCommandClick}
                        />
                      </SelectableItem>
                    </CommandGroup>
                  )}
                  {mainContextStoreComponentInstanceId && (
                    <>
                      <CommandGroup heading="Standard Actions">
                        {matchingStandardActionCommands?.map(
                          (standardActionCommand) => (
                            <SelectableItem
                              itemId={standardActionCommand.id}
                              key={standardActionCommand.id}
                            >
                              <CommandMenuItem
                                id={standardActionCommand.id}
                                label={standardActionCommand.label}
                                Icon={standardActionCommand.Icon}
                                onClick={standardActionCommand.onCommandClick}
                              />
                            </SelectableItem>
                          ),
                        )}
                      </CommandGroup>

                      <CommandGroup heading="Workflows">
                        {matchingWorkflowRunCommands?.map(
                          (workflowRunCommand) => (
                            <SelectableItem
                              itemId={workflowRunCommand.id}
                              key={workflowRunCommand.id}
                            >
                              <CommandMenuItem
                                id={workflowRunCommand.id}
                                label={workflowRunCommand.label}
                                Icon={workflowRunCommand.Icon}
                                onClick={workflowRunCommand.onCommandClick}
                              />
                            </SelectableItem>
                          ),
                        )}
                      </CommandGroup>
                    </>
                  )}
                  {commandGroups.map(({ heading, items, renderItem }) =>
                    items?.length ? (
                      <CommandGroup heading={heading} key={heading}>
                        {items.map((item) => {
                          const { id, Icon, label, to, onClick, key } =
                            renderItem(item);
                          return (
                            <SelectableItem itemId={id} key={id}>
                              <CommandMenuItem
                                key={key}
                                id={id}
                                Icon={Icon}
                                label={label}
                                to={to}
                                onClick={onClick}
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
        </StyledCommandMenu>
      )}
    </>
  );
};
