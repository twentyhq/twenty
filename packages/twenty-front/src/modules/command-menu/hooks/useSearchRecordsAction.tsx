import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { Company } from '@/companies/types/Company';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap } from '@/object-record/relation-picker/hooks/useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import isEmpty from 'lodash.isempty';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { Avatar, IconCheckbox, IconNotes } from 'twenty-ui';
import { useDebounce } from 'use-debounce';
import { getLogoUrlFromDomainName } from '~/utils';

export const useSearchRecordsAction = () => {
  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300);

  const {
    matchesSearchFilterObjectRecordsQueryResult,
    matchesSearchFilterObjectRecordsLoading: loading,
  } = useMultiObjectSearch({
    excludedObjects: [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note],
    searchFilterValue: deferredCommandMenuSearch ?? undefined,
    limit: 8,
  });

  const { objectRecordsMap: matchesSearchFilterObjectRecords } =
    useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap({
      multiObjectRecordsQueryResult:
        matchesSearchFilterObjectRecordsQueryResult,
    });

  const { loading: isNotesLoading, records: notes } = useFindManyRecords<Note>({
    objectNameSingular: CoreObjectNameSingular.Note,
    filter: deferredCommandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${deferredCommandMenuSearch}%` } },
          { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: 8,
  });

  const { loading: isTasksLoading, records: tasks } = useFindManyRecords<Task>({
    objectNameSingular: CoreObjectNameSingular.Task,
    filter: deferredCommandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${deferredCommandMenuSearch}%` } },
          { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: 8,
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

  const openNoteRightDrawer = useOpenActivityRightDrawer({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const openTaskRightDrawer = useOpenActivityRightDrawer({
    objectNameSingular: CoreObjectNameSingular.Task,
  });

  const noteCommands = useMemo(
    () =>
      notes?.map((note) => ({
        id: note.id,
        label: note.title ?? '',
        to: '',
        onCommandClick: () => openNoteRightDrawer(note.id),
        shouldCloseCommandMenuOnClick: true,
        Icon: IconNotes,
      })),
    [notes, openNoteRightDrawer],
  );

  const tasksCommands = useMemo(
    () =>
      tasks?.map((task) => ({
        id: task.id,
        label: task.title ?? '',
        to: '',
        onCommandClick: () => openTaskRightDrawer(task.id),
        shouldCloseCommandMenuOnClick: true,
        Icon: IconCheckbox,
      })),
    [tasks, openTaskRightDrawer],
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

  const commands = [
    ...peopleCommands,
    ...companyCommands,
    ...opportunityCommands,
    ...noteCommands,
    ...tasksCommands,
    ...customObjectCommands,
  ];

  return {
    loading: loading || isNotesLoading || isTasksLoading,
    commands,
    hasMore: false,
    pageSize: 0,
    onLoadMore: () => {},
  };
};
