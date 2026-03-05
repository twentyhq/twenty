import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useCommandMenuSearchRecords } from '@/command-menu/hooks/useCommandMenuSearchRecords';
import { useMemo } from 'react';

export const SidePanelSearchRecordsPage = () => {
  const { commandGroups, loading, noResults } = useCommandMenuSearchRecords();

  const selectableItemIds = useMemo(() => {
    return commandGroups
      .flatMap((group) => group.items)
      .map((item) => item.key);
  }, [commandGroups]);

  return (
    <SidePanelList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      loading={loading}
      noResults={noResults}
    />
  );
};
