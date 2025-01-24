import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useOpenCopilotRightDrawer } from '@/activities/copilot/right-drawer/hooks/useOpenCopilotRightDrawer';
import { copilotQueryState } from '@/activities/copilot/right-drawer/states/copilotQueryState';
import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { COMMAND_MENU_NAVIGATE_COMMANDS } from '@/command-menu/constants/CommandMenuNavigateCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import {
  Command,
  CommandScope,
  CommandType,
} from '@/command-menu/types/Command';
import { Company } from '@/companies/types/Company';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap } from '@/object-record/relation-picker/hooks/useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import isEmpty from 'lodash.isempty';
import { useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Avatar, IconCheckbox, IconNotes, IconSparkles } from 'twenty-ui';
import { useDebounce } from 'use-debounce';
import { FeatureFlagKey } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const useCommandMenuCommands = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );
  const openActivityRightDrawer = useOpenActivityRightDrawer({
    objectNameSingular: CoreObjectNameSingular.Note,
  });
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const commandMenuSearch = useRecoilValue(commandMenuSearchState);
  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300); // 200ms - 500ms

  const isCopilotEnabled = useIsFeatureEnabled(FeatureFlagKey.IsCopilotEnabled);
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

  const navigateCommands = Object.values(COMMAND_MENU_NAVIGATE_COMMANDS);

  const actionRecordSelectionCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.RecordSelection,
    }));

  const actionGlobalCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.Global,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.Global,
    }));

  const workflowRunRecordSelectionCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.WorkflowRun &&
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
      scope: CommandScope.RecordSelection,
    }));

  const workflowRunGlobalCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.WorkflowRun &&
        actionMenuEntry.scope === ActionMenuEntryScope.Global,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
      scope: CommandScope.Global,
    }));

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

  const peopleCommands = useMemo(
    () =>
      people?.map(({ id, name: { firstName, lastName }, avatarUrl }) => ({
        id,
        label: `${firstName} ${lastName}`,
        to: `object/person/${id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type="rounded"
            avatarUrl={avatarUrl}
            placeholderColorSeed={id}
            placeholder={`${firstName} ${lastName}`}
          />
        ),
      })),
    [people],
  );

  const companyCommands = useMemo(
    () =>
      companies?.map((company) => ({
        id: company.id,
        label: company.name ?? '',
        to: `object/company/${company.id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            placeholderColorSeed={company.id}
            placeholder={company.name}
            avatarUrl={getLogoUrlFromDomainName(
              getCompanyDomainName(company as Company),
            )}
          />
        ),
      })),
    [companies],
  );

  const opportunityCommands = useMemo(
    () =>
      opportunities?.map(({ id, name }) => ({
        id,
        label: name ?? '',
        to: `object/opportunity/${id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type="rounded"
            avatarUrl={null}
            placeholderColorSeed={id}
            placeholder={name ?? ''}
          />
        ),
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
        shouldCloseCommandMenuOnClick: true,
        Icon: IconNotes,
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
        shouldCloseCommandMenuOnClick: true,
        Icon: IconCheckbox,
      })),
    [tasks, openActivityRightDrawer],
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

  const customObjectCommands = useMemo(() => {
    const customObjectCommandsArray: Command[] = [];
    Object.values(customObjectRecordsMap).forEach((objectRecords) => {
      customObjectCommandsArray.push(
        ...objectRecords.map((objectRecord) => ({
          id: objectRecord.record.id,
          label: objectRecord.recordIdentifier.name,
          to: `object/${objectRecord.objectMetadataItem.nameSingular}/${objectRecord.record.id}`,
          shouldCloseCommandMenuOnClick: true,
          Icon: () => (
            <Avatar
              type="rounded"
              avatarUrl={objectRecord.record.avatarUrl}
              placeholderColorSeed={objectRecord.record.id}
              placeholder={objectRecord.recordIdentifier.name ?? ''}
            />
          ),
        })),
      );
    });

    return customObjectCommandsArray;
  }, [customObjectRecordsMap]);

  const isLoading = loading || isNotesLoading || isTasksLoading;

  return {
    copilotCommands,
    navigateCommands,
    actionRecordSelectionCommands,
    actionGlobalCommands,
    workflowRunRecordSelectionCommands,
    workflowRunGlobalCommands,
    peopleCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    tasksCommands,
    customObjectCommands,
    isLoading,
  };
};
