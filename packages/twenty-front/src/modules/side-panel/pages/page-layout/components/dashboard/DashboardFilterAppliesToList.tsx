import { useDashboardFilterWidgetRows } from '@/page-layout/hooks/useDashboardFilterWidgetRows';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { setDashboardFilterWidgetSettingInDraft } from '@/page-layout/utils/setDashboardFilterWidgetSettingInDraft';
import { Select } from '@/ui/input/components/Select';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables } from 'twenty-ui/theme';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeading = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type DashboardFilterAppliesToListProps = {
  pageLayoutId: string;
  pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'type'>;
};

export const DashboardFilterAppliesToList = ({
  pageLayoutId,
  pageLayoutFilter,
}: DashboardFilterAppliesToListProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const dashboardFilterWidgetRows = useDashboardFilterWidgetRows({
    pageLayoutId,
    pageLayoutFilter,
  });

  const setPageLayoutDraft = useSetAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  if (!isNonEmptyArray(dashboardFilterWidgetRows)) {
    return null;
  }

  const handleChange = ({
    widgetId,
    value,
  }: {
    widgetId: string;
    value: string;
  }) => {
    setPageLayoutDraft((pageLayoutDraft) =>
      setDashboardFilterWidgetSettingInDraft({
        pageLayoutDraft,
        widgetId,
        pageLayoutFilterId: pageLayoutFilter.id,
        value,
      }),
    );
  };

  return (
    <StyledContainer>
      <StyledHeading>{t`Applies to`}</StyledHeading>
      {dashboardFilterWidgetRows.map(
        ({ widgetId, widgetTitle, tabTitle, isReadOnly, value, options }) => (
          <Select
            key={widgetId}
            dropdownId={`dashboard-filter-${pageLayoutFilter.id}-widget-${widgetId}`}
            label={
              isNonEmptyString(tabTitle)
                ? t`${widgetTitle} in ${tabTitle}`
                : widgetTitle
            }
            fullWidth
            disabled={isReadOnly}
            value={value}
            options={options.map((option) => ({
              value: option.value,
              label: option.label,
              Icon: isNonEmptyString(option.iconName)
                ? getIcon(option.iconName)
                : undefined,
            }))}
            onChange={(newValue) => handleChange({ widgetId, value: newValue })}
          />
        ),
      )}
    </StyledContainer>
  );
};
