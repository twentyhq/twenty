import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { DashboardFilterChip } from '@/page-layout/components/DashboardFilterChip';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';
import { setPageLayoutFilterDefaultValueInDraft } from '@/page-layout/utils/setPageLayoutFilterDefaultValueInDraft';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import {
  type PageLayoutFilter,
  type PageLayoutFilterValue,
} from '~/generated-metadata/graphql';

type DashboardFilterEditModeChipProps = {
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'label' | 'defaultValue'>;
};

export const DashboardFilterEditModeChip = ({
  pageLayoutFilter,
}: DashboardFilterEditModeChipProps) => {
  const { id: pageLayoutFilterId, defaultValue } = pageLayoutFilter;
  const { t } = useLingui();

  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
  );
  const isOwnedByThirdPartyApplication = useIsThirdPartyApplication(
    pageLayoutPersisted?.applicationId,
  );
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
      inputLabel={t`Default for everyone`}
      disabledReason={
        isOwnedByThirdPartyApplication ? t`Managed by an app` : undefined
      }
      onChange={handleChange}
    />
  );
};
