import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { isNonEmptyString } from '@sniptt/guards';
import { normalizeSearchText } from 'twenty-ui/utilities';

export const searchSettingsDestinations = ({
  destinations,
  search,
}: {
  destinations: SettingsSearchDestination[];
  search: string;
}): SettingsSearchDestination[] => {
  const normalizedSearch = normalizeSearchText(search.trim());

  if (!isNonEmptyString(normalizedSearch)) {
    return [];
  }

  return destinations.filter(({ title, breadcrumbs, keywords }) =>
    normalizeSearchText(
      [title, ...breadcrumbs, ...keywords].join(' '),
    ).includes(normalizedSearch),
  );
};
