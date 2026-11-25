import { normalizeSearchText } from 'twenty-ui/utilities';

import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';

export const filterApplicationContentItemsBySearch = ({
  items,
  searchTerm,
  getItemLabel,
}: {
  items: ApplicationContentItem[];
  searchTerm: string;
  getItemLabel: (item: ApplicationContentItem) => string;
}) => {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  return items.filter((item) =>
    normalizeSearchText(getItemLabel(item)).includes(normalizedSearchTerm),
  );
};
