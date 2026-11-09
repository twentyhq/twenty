import { DashboardFilterChip } from '@/page-layout/components/DashboardFilterChip';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';
import { setPageLayoutFilterDefaultValueInDraft } from '@/page-layout/utils/setPageLayoutFilterDefaultValueInDraft';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import {
  type PageLayoutFilter,
  type PageLayoutFilterValue,
} from '~/generated-metadata/graphql';

type DashboardFilterEditModeChipProps = {
  pageLayoutFilter: PageLayoutFilter;
};

export const DashboardFilterEditModeChip = ({
  pageLayoutFilter,
}: DashboardFilterEditModeChipProps) => {
  const { id: pageLayoutFilterId, defaultValue } = pageLayoutFilter;
  const { t } = useLingui();

  const setPageLayoutDraft = useSetAtomComponentState(
    pageLayoutDraftComponentState,
  );

  const handleChange = (newDefaultValue: PageLayoutFilterValue | null) =>
    setPageLayoutDraft((pageLayoutDraft) =>
      setPageLayoutFilterDefaultValueInDraft({
        pageLayoutDraft,
        pageLayoutFilterId,
        defaultValue: newDefaultValue,
      }),
    );

  return (
    <DashboardFilterChip
      pageLayoutFilterId={pageLayoutFilterId}
      label={getPageLayoutFilterDisplayLabel(pageLayoutFilter)}
      value={defaultValue ?? null}
      title={t`Default for everyone`}
      onChange={handleChange}
    />
  );
};
