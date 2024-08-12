import styled from '@emotion/styled';

import { useOpenCopilotRightDrawer } from '@/activities/copilot/right-drawer/hooks/useOpenCopilotRightDrawer';
import { copilotQueryState } from '@/activities/copilot/right-drawer/states/copilotQueryState';
import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { Note } from '@/activities/types/Note';
import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuCommandsState } from '@/command-menu/states/commandMenuCommandsState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { Command, CommandType } from '@/command-menu/types/Command';
import { Company } from '@/companies/types/Company';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { Person } from '@/people/types/Person';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo, useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { Avatar, IconNotes, IconSparkles, IconX, isDefined } from 'twenty-ui';
import { getLogoUrlFromDomainName } from '~/utils';
import { generateILikeFiltersForCompositeFields } from '~/utils/array/generateILikeFiltersForCompositeFields';

const SEARCH_BAR_HEIGHT = 56;
const SEARCH_BAR_PADDING = 3;
const MOBILE_NAVIGATION_BAR_HEIGHT = 64;

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

  const { records: people } = useFindManyRecords<Person>({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: commandMenuSearch
      ? makeOrFilterVariables([
          ...generateILikeFiltersForCompositeFields(commandMenuSearch, 'name', [
            'firstName',
            'lastName',
          ]),
          { email: { ilike: `%${commandMenuSearch}%` } },
          { phone: { ilike: `%${commandMenuSearch}%` } },
        ])
      : undefined,
    limit: 3,
  });

  const { records: companies } = useFindManyRecords<Company>({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Company,
    filter: commandMenuSearch
      ? {
          name: { ilike: `%${commandMenuSearch}%` },
        }
      : undefined,
    limit: 3,
  });

  const { records: notes } = useFindManyRecords<Note>({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Note,
    filter: commandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${commandMenuSearch}%` } },
          { body: { ilike: `%${commandMenuSearch}%` } },
        ])
      : undefined,
    limit: 3,
  });

  const { records: opportunities } = useFindManyRecords({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Opportunity,
    filter: commandMenuSearch
      ? {
          name: { ilike: `%${commandMenuSearch}%` },
        }
      : undefined,
    limit: 3,
  });

  const peopleCommands = useMemo(
    () =>
      people.map(({ id, name: { firstName, lastName } }) => ({
        id,
        label: `${firstName} ${lastName}`,
        to: `object/person/${id}`,
      })),
    [people],
  );

  const companyCommands = useMemo(
    () =>
      companies.map(({ id, name }) => ({
        id,
        label: name ?? '',
        to: `object/company/${id}`,
      })),
    [companies],
  );

  const opportunityCommands = useMemo(
    () =>
      opportunities.map(({ id, name }) => ({
        id,
        label: name ?? '',
        to: `object/opportunity/${id}`,
      })),
    [opportunities],
  );

  const noteCommands = useMemo(
    () =>
      notes.map((note) => ({
        id: note.id,
        label: note.title ?? '',
        to: '',
        onCommandClick: () => openActivityRightDrawer(note.id),
      })),
    [notes, openActivityRightDrawer],
  );

  const otherCommands = useMemo(() => {
    return [
      ...peopleCommands,
      ...companyCommands,
      ...opportunityCommands,
      ...noteCommands,
    ] as Command[];
  }, [peopleCommands, companyCommands, noteCommands, opportunityCommands]);

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
      (commandMenuSearch.length > 0
        ? checkInShortcuts(cmd, commandMenuSearch) ||
          checkInLabels(cmd, commandMenuSearch)
        : true) && cmd.type === CommandType.Navigate,
  );

  const matchingCreateCommand = commandMenuCommands.filter(
    (cmd) =>
      (commandMenuSearch.length > 0
        ? checkInShortcuts(cmd, commandMenuSearch) ||
          checkInLabels(cmd, commandMenuSearch)
        : true) && cmd.type === CommandType.Create,
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
      setCopilotQuery(commandMenuSearch);
      openCopilotRightDrawer();
    },
  };

  const copilotCommands: Command[] = isCopilotEnabled ? [copilotCommand] : [];

  const selectableItemIds = copilotCommands
    .map((cmd) => cmd.id)
    .concat(matchingCreateCommand.map((cmd) => cmd.id))
    .concat(matchingNavigateCommand.map((cmd) => cmd.id))
    .concat(people.map((person) => person.id))
    .concat(companies.map((company) => company.id))
    .concat(opportunities.map((opportunity) => opportunity.id))
    .concat(notes.map((note) => note.id));

  return (
    <>
      {isCommandMenuOpened && (
        <StyledCommandMenu ref={commandMenuRef}>
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
            <ScrollWrapper>
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
                  {!matchingCreateCommand.length &&
                    !matchingNavigateCommand.length &&
                    !people.length &&
                    !companies.length &&
                    !notes.length &&
                    !opportunities.length && (
                      <StyledEmpty>No results found</StyledEmpty>
                    )}
                  {isCopilotEnabled && (
                    <CommandGroup heading="Copilot">
                      <SelectableItem itemId={copilotCommand.id}>
                        <CommandMenuItem
                          id={copilotCommand.id}
                          Icon={copilotCommand.Icon}
                          label={`${copilotCommand.label} ${
                            commandMenuSearch.length > 2
                              ? `"${commandMenuSearch}"`
                              : ''
                          }`}
                          onClick={copilotCommand.onCommandClick}
                        />
                      </SelectableItem>
                    </CommandGroup>
                  )}
                  <CommandGroup heading="Create">
                    {matchingCreateCommand.map((cmd) => (
                      <SelectableItem itemId={cmd.id} key={cmd.id}>
                        <CommandMenuItem
                          id={cmd.id}
                          to={cmd.to}
                          key={cmd.id}
                          Icon={cmd.Icon}
                          label={cmd.label}
                          onClick={cmd.onCommandClick}
                          firstHotKey={cmd.firstHotKey}
                          secondHotKey={cmd.secondHotKey}
                        />
                      </SelectableItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Navigate">
                    {matchingNavigateCommand.map((cmd) => (
                      <SelectableItem itemId={cmd.id} key={cmd.id}>
                        <CommandMenuItem
                          id={cmd.id}
                          to={cmd.to}
                          key={cmd.id}
                          label={cmd.label}
                          Icon={cmd.Icon}
                          onClick={cmd.onCommandClick}
                          firstHotKey={cmd.firstHotKey}
                          secondHotKey={cmd.secondHotKey}
                        />
                      </SelectableItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="People">
                    {people.map((person) => (
                      <SelectableItem itemId={person.id} key={person.id}>
                        <CommandMenuItem
                          id={person.id}
                          key={person.id}
                          to={`object/person/${person.id}`}
                          label={
                            person.name.firstName + ' ' + person.name.lastName
                          }
                          Icon={() => (
                            <Avatar
                              type="rounded"
                              avatarUrl={null}
                              placeholderColorSeed={person.id}
                              placeholder={
                                person.name.firstName +
                                ' ' +
                                person.name.lastName
                              }
                            />
                          )}
                        />
                      </SelectableItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Companies">
                    {companies.map((company) => (
                      <SelectableItem itemId={company.id} key={company.id}>
                        <CommandMenuItem
                          id={company.id}
                          key={company.id}
                          label={company.name}
                          to={`object/company/${company.id}`}
                          Icon={() => (
                            <Avatar
                              placeholderColorSeed={company.id}
                              placeholder={company.name}
                              avatarUrl={getLogoUrlFromDomainName(
                                getCompanyDomainName(company),
                              )}
                            />
                          )}
                        />
                      </SelectableItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Opportunities">
                    {opportunities.map((opportunity) => (
                      <SelectableItem
                        itemId={opportunity.id}
                        key={opportunity.id}
                      >
                        <CommandMenuItem
                          id={opportunity.id}
                          key={opportunity.id}
                          label={opportunity.name}
                          to={`object/opportunity/${opportunity.id}`}
                          Icon={() => (
                            <Avatar
                              type="rounded"
                              avatarUrl={null}
                              placeholderColorSeed={opportunity.id}
                              placeholder={opportunity.name}
                            />
                          )}
                        />
                      </SelectableItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Notes">
                    {notes.map((note) => (
                      <SelectableItem itemId={note.id} key={note.id}>
                        <CommandMenuItem
                          id={note.id}
                          Icon={IconNotes}
                          key={note.id}
                          label={note.title ?? ''}
                          onClick={() => openActivityRightDrawer(note.id)}
                        />
                      </SelectableItem>
                    ))}
                  </CommandGroup>
                </SelectableList>
              </StyledInnerList>
            </ScrollWrapper>
          </StyledList>
        </StyledCommandMenu>
      )}
    </>
  );
};
