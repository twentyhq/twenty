import { type SidePanelEditColumnShowSelectEntry } from '@/side-panel/pages/edit-column/types/SidePanelEditColumnShowSelectEntry';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const getSidePanelEditColumnShowSelectSearchResults = ({
  entries,
  searchQuery,
}: {
  entries: SidePanelEditColumnShowSelectEntry[];
  searchQuery: string;
}) =>
  filterBySearchQuery({
    items: entries.flatMap((entry) => [
      {
        key: entry.id,
        label: entry.label,
        icon: entry.icon,
        value: entry.value,
        parentLabel: undefined,
      },
      ...entry.summaryShowOptions.map((summaryShowOption) => ({
        key: summaryShowOption.value,
        label: summaryShowOption.label,
        icon: entry.icon,
        value: summaryShowOption.value,
        parentLabel: entry.label,
      })),
    ]),
    searchQuery,
    getSearchableValues: ({ label }) => [label],
  });
