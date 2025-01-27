import { CommandMenuList } from '@/command-menu/command-menu-list/components/CommandMenuList';
import { useSearchRecordsAction } from '@/command-menu/hooks/useSearchRecordsAction';

export const SearchRecordsPage = () => {
  const { commands, loading, hasMore, pageSize, onLoadMore } =
    useSearchRecordsAction();

  return (
    <CommandMenuList
      commands={commands}
      isLoading={loading}
      filtering={false}
      pagination={{ hasMore, pageSize, onLoadMore }}
    />
  );
};
