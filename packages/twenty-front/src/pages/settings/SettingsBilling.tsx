import React from 'react';
import styled from '@emotion/styled';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus.ts';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus.ts';
import { SettingsBillingCoverImage } from '@/billing/components/SettingsBillingCoverImage.tsx';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconCreditCard, IconCurrencyDollar } from '@/ui/display/icon';
import { Info } from '@/ui/display/info/components/Info.tsx';
import { H1Title } from '@/ui/display/typography/components/H1Title.tsx';
import { H2Title } from '@/ui/display/typography/components/H2Title.tsx';
import { Button } from '@/ui/input/button/components/Button.tsx';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section.tsx';
import { useBillingPortalSessionQuery } from '~/generated/graphql.tsx';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsBilling = () => {
  const onboardingStatus = useOnboardingStatus();
  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
  });
  const handleButtonClick = () => {
    if (data) {
      window.location.replace(data.billingPortalSession.url);
    }
  };
  return (
    <SubMenuTopBarContainer Icon={IconCurrencyDollar} title="Billing">
      <SettingsPageContainer>
        <StyledH1Title title="Billing" />
        <SettingsBillingCoverImage />
        {onboardingStatus === OnboardingStatus.Canceled && (
          <Info
            text={'Last payment failed. Please update your billing details.'}
            buttonTitle={'Update'}
            accent={'danger'}
            onClick={handleButtonClick}
          />
        )}
        <Section>
          <H2Title
            title="Manage your subscription"
            description="Edit payment method, see your invoices and more"
          />
          <Button
            Icon={IconCreditCard}
            title="View billing details"
            variant="secondary"
            onClick={handleButtonClick}
            disabled={loading}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
