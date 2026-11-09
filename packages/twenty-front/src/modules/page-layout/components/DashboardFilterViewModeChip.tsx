import { DashboardFilterChip } from '@/page-layout/components/DashboardFilterChip';
import { useCanEditDashboardFilterDefaults } from '@/page-layout/hooks/useCanEditDashboardFilterDefaults';
import { useSetDashboardFilterValue } from '@/page-layout/hooks/useSetDashboardFilterValue';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';
import { getDashboardFilterValueToStore } from '@/page-layout/utils/getDashboardFilterValueToStore';
import { isDashboardFilterValueStoredAsDefault } from '@/page-layout/utils/isDashboardFilterValueStoredAsDefault';
import { setPageLayoutFilterDefaultValueInDraft } from '@/page-layout/utils/setPageLayoutFilterDefaultValueInDraft';
import { useResetLocationHash } from '@/ui/navigation/hooks/useResetLocationHash';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCheck } from 'twenty-ui/icon';
import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

type DashboardFilterViewModeChipProps = {
  pageLayoutFilter: DashboardFilters['pageLayoutFilters'][number];
  urlValue: PageLayoutFilterValue | undefined;
};

export const DashboardFilterViewModeChip = ({
  pageLayoutFilter,
  urlValue,
}: DashboardFilterViewModeChipProps) => {
  const { id: pageLayoutFilterId, defaultValue } = pageLayoutFilter;
  const { t } = useLingui();
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );
  const { setDashboardFilterValue } = useSetDashboardFilterValue();
  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);
  const setPageLayoutDraft = useSetAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const canEditDashboardFilterDefaults = useCanEditDashboardFilterDefaults();
  const { resetLocationHash } = useResetLocationHash();

  const value = urlValue ?? defaultValue ?? null;

  const handleChange = (newValue: PageLayoutFilterValue | null) =>
    setDashboardFilterValue({
      pageLayoutFilterId,
      value: newValue ?? { conditions: [] },
      defaultValue,
    });

  // The draft mirrors the stored layout outside edit mode, so editing starts from it
  const handleSetAsDefault = () => {
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
    setPageLayoutDraft((pageLayoutDraft) =>
      setPageLayoutFilterDefaultValueInDraft({
        pageLayoutDraft,
        pageLayoutFilterId,
        defaultValue: getDashboardFilterValueToStore(value),
      }),
    );
  };

  return (
    <DashboardFilterChip
      pageLayoutFilterId={pageLayoutFilterId}
      label={getPageLayoutFilterDisplayLabel(pageLayoutFilter)}
      value={value}
      onChange={handleChange}
    >
      {canEditDashboardFilterDefaults &&
        !isDashboardFilterValueStoredAsDefault(value, defaultValue) && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconCheck />}
                onClick={handleSetAsDefault}
              >{t`Set as default`}</Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )}
    </DashboardFilterChip>
  );
};
