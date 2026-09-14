import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitRow } from '@/settings/billing/types/UsageLimitRow';
import { type UsageResourceType } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const filterUsageLimitRows = ({
  rows,
  searchText,
  resourceType,
  spenderType,
}: {
  rows: UsageLimitRow[];
  searchText: string;
  resourceType: UsageResourceType | null;
  spenderType: string | null;
}): UsageLimitRow[] => {
  const normalizedSearchText = normalizeSearchText(searchText);

  return rows
    .filter(
      (row) => !isDefined(resourceType) || row.resourceType === resourceType,
    )
    .filter((row) => !isDefined(spenderType) || row.spenderType === spenderType)
    .filter(
      (row) =>
        normalizedSearchText.length === 0 ||
        normalizeSearchText(row.name).includes(normalizedSearchText) ||
        normalizeSearchText(row.spenderName).includes(normalizedSearchText),
    );
};
