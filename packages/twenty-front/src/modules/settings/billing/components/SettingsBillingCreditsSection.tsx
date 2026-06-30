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
import { IconChartBar, IconExternalLink } from 'twenty-ui/icon';
import { HorizontalSeparator, Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import { Info, ProgressBar } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
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

  const usedCreditsDisplay = formatNumber(usedCredits, { decimals: 2 });
  const totalGrantedCreditsDisplay = formatNumber(totalGrantedCredits, {
    decimals: 2,
  });
  const grantedCreditsDisplay = formatNumber(grantedCredits, { decimals: 2 });
  const rolloverCreditsDisplay = formatNumber(rolloverCredits, { decimals: 2 });
  const rolloverCapDisplay = formatNumber(grantedCredits * 2, { decimals: 2 });

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
            value={t`${usedCreditsDisplay} / ${totalGrantedCreditsDisplay} available`}
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
                label={t`This ${intervalLabel}'s credits`}
                value={grantedCreditsDisplay}
              />
              {rolloverCredits > 0 && (
                <SettingsBillingLabelValueItem
                  label={t`Rolled over`}
                  value={`+${rolloverCreditsDisplay}`}
                />
              )}
              <Info
                accent="blue"
                text={t`Unused credits roll over, up to 2× your plan's credits (max ${rolloverCapDisplay}).`}
              />
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
