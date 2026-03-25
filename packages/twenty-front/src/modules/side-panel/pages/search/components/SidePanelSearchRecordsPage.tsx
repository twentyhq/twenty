import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { useMemo } from 'react';

export const SidePanelSearchRecordsPage = () => {
  const { commandGroups, loading, noResults } = useSidePanelSearchRecords();

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
