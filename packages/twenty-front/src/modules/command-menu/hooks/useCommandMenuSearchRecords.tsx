import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui';
import { useDebounce } from 'use-debounce';
import { useSearchQuery } from '~/generated/graphql';

export const useCommandMenuSearchRecords = () => {
  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300);

  const { data: searchData, loading } = useSearchQuery({
    variables: {
      searchInput: deferredCommandMenuSearch ?? '',
      limit: MAX_SEARCH_RESULTS,
      excludedObjectNameSingulars: ['workspaceMember'],
    },
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const commands = useMemo(() => {
    return (searchData?.search ?? []).map((searchRecord) => {
      const command = {
        id: searchRecord.recordId,
        label: searchRecord.label,
        description: capitalize(searchRecord.objectNameSingular),
        to: `object/${searchRecord.objectNameSingular}/${searchRecord.recordId}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type={
              searchRecord.objectNameSingular === 'company'
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
          searchRecord.objectNameSingular as CoreObjectNameSingular,
        )
      ) {
        return {
          ...command,
          to: '',
          onCommandClick: () => {
            searchRecord.objectNameSingular === 'task'
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
  }, [searchData, openRecordInCommandMenu]);

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
