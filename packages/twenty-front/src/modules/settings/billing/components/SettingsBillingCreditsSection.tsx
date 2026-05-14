import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { ResourceCreditPriceSelector } from '@/settings/billing/components/internal/ResourceCreditPriceSelector';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentBillingFlags } from '@/settings/billing/hooks/useCurrentBillingFlags';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  HorizontalSeparator,
  IconChartBar,
  IconExternalLink,
} from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

const StyledCreditUsageFooterActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsBillingCreditsSection = ({
  currentBillingSubscription,
}: {
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
}) => {
  const { theme } = useContext(ThemeContext);
  const subscriptionStatus = useSubscriptionStatus();
  const { formatNumber } = useNumberFormat();

  const { isMonthlyPlan } = useCurrentBillingFlags();

  const { getResourceCreditPricesByInterval } = useCurrentResourceCredit();

  const { getIntervalLabel } = useBillingWording();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  const { getResourceCreditUsage } = useGetResourceCreditUsage();

  const { usedCredits, grantedCredits, totalGrantedCredits, rolloverCredits } =
    getResourceCreditUsage();

  const progressBarValue = (usedCredits / totalGrantedCredits) * 100;

  const intervalLabel = getIntervalLabel(isMonthlyPlan);

  const resourceCreditPrices = getResourceCreditPricesByInterval(
    currentBillingSubscription.interval,
  );

  return (
    <>
      <Section>
        <H2Title
          title={t`Credit Usage`}
          description={t`Track your ${intervalLabel} workflow credit consumption.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`Credits Used`}
            value={`${formatNumber(usedCredits, { abbreviate: true, decimals: 2 })}/${formatNumber(totalGrantedCredits, { abbreviate: true, decimals: 2 })}`}
          />
          <ProgressBar
            value={progressBarValue}
            barColor={
              progressBarValue > 100 ? theme.color.red8 : theme.color.blue
            }
            backgroundColor={theme.background.tertiary}
            withBorderRadius={true}
          />

          {!isTrialing && (
            <>
              <HorizontalSeparator noMargin color={theme.background.tertiary} />
              <SettingsBillingLabelValueItem
                label={t`Base Credits`}
                value={formatNumber(grantedCredits, {
                  abbreviate: true,
                  decimals: 2,
                })}
              />
              {rolloverCredits > 0 && (
                <SettingsBillingLabelValueItem
                  label={t`Rollover Credits`}
                  value={formatNumber(rolloverCredits, {
                    abbreviate: true,
                    decimals: 2,
                  })}
                  tooltipText={t`Unused credits from the previous period. Expired at the end of the period.`}
                  tooltipId="rollover-credits-info"
                />
              )}
              {rolloverCredits > 0 && (
                <SettingsBillingLabelValueItem
                  label={t`Total Available`}
                  value={formatNumber(totalGrantedCredits, {
                    abbreviate: true,
                    decimals: 2,
                  })}
                />
              )}
            </>
          )}
        </SubscriptionInfoContainer>

        <StyledCreditUsageFooterActions>
          <UndecoratedLink to={getSettingsPath(SettingsPath.Usage)}>
            <Button
              Icon={IconChartBar}
              title={t`View usage`}
              variant="secondary"
            />
          </UndecoratedLink>
          <Button
            Icon={IconExternalLink}
            title={t`How credits work`}
            variant="secondary"
            onClick={() =>
              window.open(
                getDocumentationUrl({
                  path: DOCUMENTATION_PATHS.USER_GUIDE_BILLING_CAPABILITIES_CREDITS,
                }),
                '_blank',
              )
            }
          />
        </StyledCreditUsageFooterActions>
      </Section>
      <Section>
        <ResourceCreditPriceSelector
          resourceCreditPrices={resourceCreditPrices}
          isTrialing={isTrialing}
        />
      </Section>
    </>
  );
};
