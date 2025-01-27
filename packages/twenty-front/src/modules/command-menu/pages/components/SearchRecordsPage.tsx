import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useSearchRecordsAction } from '@/command-menu/hooks/useSearchRecordsAction';

export const SearchRecordsPage = () => {
  const { commandGroups, loading, noResultFound } = useSearchRecordsAction();

  return (
    <CommandMenuList
      commandGroups={commandGroups}
      selectableItemIds={[]}
      loading={loading}
      noResults={noResultFound}
    />
  );
};
