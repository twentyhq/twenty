import React from 'react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus.ts';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState.ts';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus.ts';
import { SettingsBillingCoverImage } from '@/billing/components/SettingsBillingCoverImage.tsx';
import { supportChatState } from '@/client-config/states/supportChatState.ts';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SupportChat } from '@/support/components/SupportChat.tsx';
import { IconCreditCard, IconCurrencyDollar } from '@/ui/display/icon';
import { Info } from '@/ui/display/info/components/Info.tsx';
import { H1Title } from '@/ui/display/typography/components/H1Title.tsx';
import { H2Title } from '@/ui/display/typography/components/H2Title.tsx';
import { Button } from '@/ui/input/button/components/Button.tsx';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section.tsx';
import { useBillingPortalSessionQuery } from '~/generated/graphql.tsx';
import { isNonNullable } from '~/utils/isNonNullable';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledInvisibleChat = styled.div`
  display: none;
`;

export const SettingsBilling = () => {
  const onboardingStatus = useOnboardingStatus();
  const supportChat = useRecoilValue(supportChatState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
  });

  const displayPaymentFailInfo =
    onboardingStatus === OnboardingStatus.PastDue ||
    onboardingStatus === OnboardingStatus.Unpaid;

  const displaySubscriptionCanceledInfo =
    onboardingStatus === OnboardingStatus.Canceled;

  const openBillingPortal = () => {
    if (isNonNullable(data)) {
      window.location.replace(data.billingPortalSession.url);
    }
  };

  const openChat = () => {
    if (isNonEmptyString(supportChat.supportDriver)) {
      window.FrontChat?.('show');
    } else {
      window.location.href =
        'mailto:felix@twenty.com?' +
        `subject=Subscription Recovery for workspace ${currentWorkspace?.id}&` +
        'body=Hey,%0D%0A%0D%0AMy subscription is canceled and I would like to subscribe a new one.' +
        'Can you help me?%0D%0A%0D%0ACheers';
    }
  };

  return (
    <SubMenuTopBarContainer Icon={IconCurrencyDollar} title="Billing">
      <SettingsPageContainer>
        <StyledH1Title title="Billing" />
        <SettingsBillingCoverImage />
        {displaySubscriptionCanceledInfo && (
          <Info
            text={'Subscription canceled. Please contact us to start a new one'}
            buttonTitle={'Contact Us'}
            accent={'danger'}
            onClick={openChat}
          />
        )}
        {displayPaymentFailInfo && (
          <Info
            text={'Last payment failed. Please update your billing details.'}
            buttonTitle={'Update'}
            accent={'danger'}
            onClick={openBillingPortal}
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
            onClick={openBillingPortal}
            disabled={loading}
          />
        </Section>
      </SettingsPageContainer>
      <StyledInvisibleChat>
        <SupportChat />
      </StyledInvisibleChat>
    </SubMenuTopBarContainer>
  );
};
