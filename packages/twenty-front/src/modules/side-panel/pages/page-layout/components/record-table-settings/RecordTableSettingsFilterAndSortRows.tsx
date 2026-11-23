import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { useRecordTableSettingsDescriptions } from '@/side-panel/pages/page-layout/hooks/useRecordTableSettingsDescriptions';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type View } from '@/views/types/View';
import { useLingui } from '@lingui/react/macro';
import { IconArrowsSort, IconFilter } from 'twenty-ui/icon';

type RecordTableSettingsFilterAndSortRowsProps = {
  view: View | undefined;
};

export const RecordTableSettingsFilterAndSortRows = ({
  view,
}: RecordTableSettingsFilterAndSortRowsProps) => {
  const { t } = useLingui();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const { filterDescription, sortDescription } =
    useRecordTableSettingsDescriptions({ view });

  const handleFilterClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableFilter);
  };

  const handleSortClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableSort);
  };

  return (
    <>
      <SelectableListItem
        itemId="record-table-filter"
        onEnter={handleFilterClick}
      >
        <CommandMenuItem
          id="record-table-filter"
          label={t`Filter`}
          Icon={IconFilter}
          hasSubMenu
          onClick={handleFilterClick}
          description={filterDescription}
          contextualTextPosition="right"
        />
      </SelectableListItem>
      <SelectableListItem itemId="record-table-sort" onEnter={handleSortClick}>
        <CommandMenuItem
          id="record-table-sort"
          label={t`Sort`}
          Icon={IconArrowsSort}
          hasSubMenu
          onClick={handleSortClick}
          description={sortDescription}
          contextualTextPosition="right"
        />
      </SelectableListItem>
    </>
  );
};
