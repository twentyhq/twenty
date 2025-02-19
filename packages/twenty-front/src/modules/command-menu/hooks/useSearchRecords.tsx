import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Company } from '@/companies/types/Company';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap } from '@/object-record/relation-picker/hooks/useMultiObjectSearchQueryResultFormattedAsObjectRecordsMap';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import isEmpty from 'lodash.isempty';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { Avatar, IconCheckbox, IconNotes } from 'twenty-ui';
import { useDebounce } from 'use-debounce';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

const MAX_SEARCH_RESULTS_PER_OBJECT = 8;

export const useSearchRecords = () => {
  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const isRichTextV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsRichTextV2Enabled,
  );

  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300);

  const {
    matchesSearchFilterObjectRecordsQueryResult,
    matchesSearchFilterObjectRecordsLoading: loading,
  } = useMultiObjectSearch({
    excludedObjects: [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note],
    searchFilterValue: deferredCommandMenuSearch ?? undefined,
    limit: MAX_SEARCH_RESULTS_PER_OBJECT,
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
          isRichTextV2Enabled
            ? {
                bodyV2: {
                  markdown: { ilike: `%${deferredCommandMenuSearch}%` },
                },
              }
            : { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: MAX_SEARCH_RESULTS_PER_OBJECT,
  });

  const { loading: isTasksLoading, records: tasks } = useFindManyRecords<Task>({
    objectNameSingular: CoreObjectNameSingular.Task,
    filter: deferredCommandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${deferredCommandMenuSearch}%` } },
          isRichTextV2Enabled
            ? {
                bodyV2: {
                  markdown: { ilike: `%${deferredCommandMenuSearch}%` },
                },
              }
            : { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: MAX_SEARCH_RESULTS_PER_OBJECT,
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
        description: 'Person',
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
        description: 'Company',
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
        description: 'Opportunity',
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
        description: 'Note',
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
        description: 'Task',
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
    return Object.values(customObjectRecordsMap).flatMap((objectRecords) =>
      objectRecords.map((objectRecord) => ({
        id: objectRecord.record.id,
        label: objectRecord.recordIdentifier.name,
        description: objectRecord.objectMetadataItem.labelSingular,
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
  }, [customObjectRecordsMap]);

  const commands = [
    ...(peopleCommands ?? []),
    ...(companyCommands ?? []),
    ...(opportunityCommands ?? []),
    ...(noteCommands ?? []),
    ...(tasksCommands ?? []),
    ...(customObjectCommands ?? []),
  ];

  const noResults =
    !peopleCommands?.length &&
    !companyCommands?.length &&
    !opportunityCommands?.length &&
    !noteCommands?.length &&
    !tasksCommands?.length &&
    !customObjectCommands?.length;

  return {
    loading: loading || isNotesLoading || isTasksLoading,
    noResults,
    commandGroups: [
      {
        heading: t`Results`,
        items: commands,
      },
    ],
    hasMore: false,
    pageSize: 0,
    onLoadMore: () => {},
  };
};
