import { t } from '@lingui/core/macro';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

export const getNewPageLayoutFilterLabel = (
  pageLayoutFilters: Pick<PageLayoutFilter, 'label'>[],
): string => {
  const usedLabels = new Set(pageLayoutFilters.map(({ label }) => label));

  const numberedLabels = pageLayoutFilters.map(
    (_, index) => t`Period ${index + 2}`,
  );

  return (
    [t`Period`, ...numberedLabels].find((label) => !usedLabels.has(label)) ??
    t`Period`
  );
};
