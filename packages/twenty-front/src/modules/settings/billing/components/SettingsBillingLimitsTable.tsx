import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/input';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsBillingLimitSpenderCell } from '@/settings/billing/components/SettingsBillingLimitSpenderCell';
import { SettingsBillingLimitsFilterDropdown } from '@/settings/billing/components/SettingsBillingLimitsFilterDropdown';
import { useUsageLimitRows } from '@/settings/billing/hooks/useUsageLimitRows';
import { type UsageLimitRow } from '@/settings/billing/types/UsageLimitRow';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { filterUsageLimitRows } from '@/settings/billing/utils/filterUsageLimitRows';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { ProgressRing } from '@/ui/feedback/progress-ring/components/ProgressRing';
import { type UsageResourceType } from '~/generated-metadata/graphql';

const GRID_AUTO_COLUMNS = '1.2fr 1fr 96px 120px';

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledIcon = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledUsed = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledRingAnchor = styled.span`
  display: flex;
`;

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const NameCell = ({ item }: { item: UsageLimitRow }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledCell>
      <StyledIcon>
        <item.NameIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIcon>
      <StyledName>{item.name}</StyledName>
    </StyledCell>
  );
};

const UsedCell = ({ item }: { item: UsageLimitRow }) => {
  const { t } = useLingui();

  if (!isDefined(item.consumedPercentage) || !isDefined(item.consumedText)) {
    return <StyledEmptyValue>—</StyledEmptyValue>;
  }

  const anchorId = `usage-limit-ring-${item.id}`;

  return (
    <StyledUsed>
      <span>{item.consumedPercentage}%</span>
      <StyledRingAnchor id={anchorId}>
        <ProgressRing
          value={item.consumedPercentage}
          barColor={getUsageLimitRingColor({
            consumedPercentage: item.consumedPercentage,
            isExhausted: item.isExhausted,
          })}
        />
      </StyledRingAnchor>
      <AppTooltip
        anchorSelect={`#${anchorId}`}
        title={t`${item.consumedText} used`}
        description={t`Limit: ${item.limitText}`}
        place="top"
        delay={TooltipDelay.shortDelay}
        positionStrategy="fixed"
      />
    </StyledUsed>
  );
};

type SettingsBillingLimitsTableProps = {
  quotas: UsageQuotaWithConsumption[];
};

export const SettingsBillingLimitsTable = ({
  quotas,
}: SettingsBillingLimitsTableProps) => {
  const { t } = useLingui();

  const [searchText, setSearchText] = useState('');
  const [resourceType, setResourceType] = useState<UsageResourceType | null>(
    null,
  );
  const [spenderType, setSpenderType] = useState<string | null>(null);

  const rows = useUsageLimitRows(quotas);

  const resourceTypes = useMemo(
    () => [
      ...new Set(
        rows
          .map((row) => row.resourceType)
          .filter((candidate): candidate is UsageResourceType =>
            isDefined(candidate),
          ),
      ),
    ],
    [rows],
  );

  const spenderTypes = useMemo(
    () => [...new Set(rows.map((row) => row.spenderType))],
    [rows],
  );

  const filteredRows = filterUsageLimitRows({
    rows,
    searchText,
    resourceType,
    spenderType,
  });

  return (
    <>
      <SettingsTableListSection<UsageLimitRow>
        title={t`Limits`}
        description={t`Caps on what your workspace can spend and who they apply to`}
        toolbar={
          <SearchInput
            placeholder={t`Search a limit`}
            value={searchText}
            onChange={setSearchText}
            filterButtonAriaLabel={t`Filter limits`}
            filterDropdown={(filterButton: ReactNode) => (
              <SettingsBillingLimitsFilterDropdown
                filterButton={filterButton}
                resourceTypes={resourceTypes}
                spenderTypes={spenderTypes}
                selectedResourceType={resourceType}
                selectedSpenderType={spenderType}
                onSelectResourceType={setResourceType}
                onSelectSpenderType={setSpenderType}
              />
            )}
          />
        }
        items={filteredRows}
        columns={[
          { label: t`Usage`, Cell: NameCell },
          {
            label: t`Applies to`,
            Cell: ({ item }) => <SettingsBillingLimitSpenderCell row={item} />,
          },
          { label: t`Used`, align: 'right', Cell: UsedCell },
          {
            label: t`Period`,
            align: 'right',
            Cell: ({ item }) => <>{item.periodName}</>,
          },
        ]}
        gridAutoColumns={GRID_AUTO_COLUMNS}
      />
      {filteredRows.length === 0 && (
        <SettingsEmptyPlaceholder>
          {t`No limit matches your search.`}
        </SettingsEmptyPlaceholder>
      )}
    </>
  );
};
