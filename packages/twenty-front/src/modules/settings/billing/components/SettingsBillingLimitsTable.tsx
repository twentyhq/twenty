import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/input';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsBillingLimitSpenderCell } from '@/settings/billing/components/SettingsBillingLimitSpenderCell';
import { SettingsBillingLimitAmount } from '@/settings/billing/components/internal/SettingsBillingLimitAmount';
import { SettingsBillingLimitsFilterDropdown } from '@/settings/billing/components/SettingsBillingLimitsFilterDropdown';
import { useUsageLimitRows } from '@/settings/billing/hooks/useUsageLimitRows';
import { type UsageLimitRow } from '@/settings/billing/types/UsageLimitRow';
import { type UsageQuotaWithConsumption } from '@/settings/billing/types/UsageQuotaWithConsumption';
import { filterUsageLimitRows } from '@/settings/billing/utils/filterUsageLimitRows';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsNameCellSecondaryLabel } from '@/settings/components/SettingsNameCellSecondaryLabel';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { ProgressRing } from '@/ui/feedback/progress-ring/components/ProgressRing';
import { type UsageResourceType } from '~/generated-metadata/graphql';

const GRID_AUTO_COLUMNS = '1.2fr 1fr 120px 96px';

const USED_RING_SIZE = 14;

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledNameIcon = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
`;

const StyledUsed = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledToolbar = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledTooltipRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const NameCell = ({ item }: { item: UsageLimitRow }) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const deactivatedAnchorId = `usage-limit-deactivated-${item.id}`;

  return (
    <StyledCell>
      <StyledNameIcon>
        <item.NameIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledNameIcon>
      <StyledNameContainer>
        <StyledName>{item.name}</StyledName>
        {!item.isEnforced && (
          <>
            <SettingsNameCellSecondaryLabel id={deactivatedAnchorId}>
              {t`Deactivated`}
            </SettingsNameCellSecondaryLabel>
            <AppTooltip
              anchorSelect={`#${deactivatedAnchorId}`}
              title={t`Limits on members, API keys and apps require the Organization plan.`}
              place="top"
              delay={TooltipDelay.shortDelay}
              positionStrategy="fixed"
            />
          </>
        )}
      </StyledNameContainer>
    </StyledCell>
  );
};

const UsedCell = ({ item }: { item: UsageLimitRow }) => {
  const { t } = useLingui();

  const anchorId = `usage-limit-ring-${item.id}`;

  return (
    <StyledUsed id={anchorId}>
      {isDefined(item.consumedPercentage) ? (
        <>
          <span>{item.consumedPercentage}%</span>
          <ProgressRing
            size={USED_RING_SIZE}
            value={item.consumedPercentage}
            barColor={getUsageLimitRingColor({
              consumedPercentage: item.consumedPercentage,
              isExhausted: item.isExhausted,
            })}
          />
        </>
      ) : (
        <StyledEmptyValue>—</StyledEmptyValue>
      )}
      <AppTooltip
        anchorSelect={`#${anchorId}`}
        place="top"
        delay={TooltipDelay.shortDelay}
        positionStrategy="fixed"
      >
        <StyledTooltipRows>
          {isDefined(item.consumedText) && (
            <StyledTooltipRow>
              {t`Used`}
              <SettingsBillingLimitAmount
                text={item.consumedText}
                isCreditsMeter={item.isCreditsMeter}
              />
            </StyledTooltipRow>
          )}
          <StyledTooltipRow>
            {t`Limit`}
            <SettingsBillingLimitAmount
              text={item.limitText}
              isCreditsMeter={item.isCreditsMeter}
            />
          </StyledTooltipRow>
        </StyledTooltipRows>
      </AppTooltip>
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

  const resourceTypes = [
    ...new Set(
      rows
        .map((row) => row.resourceType)
        .filter((candidate): candidate is UsageResourceType =>
          isDefined(candidate),
        ),
    ),
  ];

  const spenderTypes = [...new Set(rows.map((row) => row.spenderType))];

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
          <StyledToolbar>
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
          </StyledToolbar>
        }
        items={filteredRows}
        columns={[
          { label: t`Usage`, Cell: NameCell },
          {
            label: t`Applies to`,
            Cell: ({ item }) => <SettingsBillingLimitSpenderCell row={item} />,
          },
          {
            label: t`Period`,
            align: 'right',
            Cell: ({ item }) => <>{item.periodName}</>,
          },
          { label: t`Used`, align: 'right', Cell: UsedCell },
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
