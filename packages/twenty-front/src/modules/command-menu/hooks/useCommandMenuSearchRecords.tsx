import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import { Avatar } from 'twenty-ui';
import { useDebounce } from 'use-debounce';
import { useGlobalSearchQuery } from '~/generated/graphql';

export const useCommandMenuSearchRecords = () => {
  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300);

  const { data: globalSearchData, loading } = useGlobalSearchQuery({
    variables: {
      searchInput: deferredCommandMenuSearch ?? '',
      limit: MAX_SEARCH_RESULTS,
      excludedObjectNameSingulars: ['workspaceMember'],
    },
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const commands = useMemo(() => {
    return (globalSearchData?.globalSearch ?? []).map((searchRecord) => {
      const command = {
        id: searchRecord.recordId,
        label: searchRecord.label,
        description: capitalize(searchRecord.objectSingularName),
        to: `object/${searchRecord.objectSingularName}/${searchRecord.recordId}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type={
              searchRecord.objectSingularName === 'company'
                ? 'squared'
                : 'rounded'
            }
            avatarUrl={searchRecord.imageUrl}
            placeholderColorSeed={searchRecord.recordId}
            placeholder={searchRecord.label}
          />
        ),
      };
      if (
        [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note].includes(
          searchRecord.objectSingularName as CoreObjectNameSingular,
        )
      ) {
        return {
          ...command,
          to: '',
          onCommandClick: () => {
            searchRecord.objectSingularName === 'task'
              ? openRecordInCommandMenu({
                  recordId: searchRecord.recordId,
                  objectNameSingular: CoreObjectNameSingular.Task,
                })
              : openRecordInCommandMenu({
                  recordId: searchRecord.recordId,
                  objectNameSingular: CoreObjectNameSingular.Note,
                });
          },
        };
      }
      return command;
    });
  }, [globalSearchData, openRecordInCommandMenu]);

  return {
    loading,
    noResults: !commands?.length,
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
