import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { IconCalendarEvent, IconCircleX } from '@tabler/icons-react';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus.ts';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus.ts';
import { SettingsBillingCoverImage } from '@/billing/components/SettingsBillingCoverImage.tsx';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SupportChat } from '@/support/components/SupportChat.tsx';
import { AppPath } from '@/types/AppPath.ts';
import { IconCreditCard, IconCurrencyDollar } from '@/ui/display/icon';
import { Info } from '@/ui/display/info/components/Info.tsx';
import { H1Title } from '@/ui/display/typography/components/H1Title.tsx';
import { H2Title } from '@/ui/display/typography/components/H2Title.tsx';
import { Button } from '@/ui/input/button/components/Button.tsx';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal.tsx';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section.tsx';
import {
  useBillingPortalSessionQuery,
  useUpdateBillingSubscriptionMutation,
} from '~/generated/graphql.tsx';
import { isDefined } from '~/utils/isDefined';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledInvisibleChat = styled.div`
  display: none;
`;

export const SettingsBilling = () => {
  const navigate = useNavigate();
  const onboardingStatus = useOnboardingStatus();
  const [isSwitchingToYearlyModalOpen, setIsSwitchingToYearlyModalOpen] =
    useState(false);
  const [updateBillingSubscription] = useUpdateBillingSubscriptionMutation();
  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
  });

  const billingPortalButtonDisabled =
    loading || !isDefined(data) || !isDefined(data.billingPortalSession.url);

  const displayPaymentFailInfo =
    onboardingStatus === OnboardingStatus.PastDue ||
    onboardingStatus === OnboardingStatus.Unpaid;

  const displaySubscriptionCanceledInfo =
    onboardingStatus === OnboardingStatus.Canceled;

  const displaySubscribeInfo =
    onboardingStatus === OnboardingStatus.CompletedWithoutSubscription;

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      window.location.replace(data.billingPortalSession.url);
    }
  };

  const openSwitchingToYearlyModal = () => {
    setIsSwitchingToYearlyModalOpen(true);
  };

  const switchToYearly = async () => {
    await updateBillingSubscription();
  };

  const redirectToSubscribePage = () => {
    navigate(AppPath.PlanRequired);
  };

  return (
    <SubMenuTopBarContainer Icon={IconCurrencyDollar} title="Billing">
      <SettingsPageContainer>
        <StyledH1Title title="Billing" />
        <SettingsBillingCoverImage />
        {displayPaymentFailInfo && (
          <Info
            text={'Last payment failed. Please update your billing details.'}
            buttonTitle={'Update'}
            accent={'danger'}
            onClick={openBillingPortal}
          />
        )}
        {displaySubscriptionCanceledInfo && (
          <Info
            text={'Subscription canceled. Please start a new one'}
            buttonTitle={'Subscribe'}
            accent={'danger'}
            onClick={redirectToSubscribePage}
          />
        )}
        {displaySubscribeInfo ? (
          <Info
            text={'Your workspace does not have an active subscription'}
            buttonTitle={'Subscribe'}
            accent={'danger'}
            onClick={redirectToSubscribePage}
          />
        ) : (
          <>
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
              />
            </Section>
            <Section>
              <H2Title
                title="Edit billing interval"
                description="Switch from monthly to yearly"
              />
              <Button
                Icon={IconCalendarEvent}
                title="Switch to yearly"
                variant="secondary"
                onClick={openSwitchingToYearlyModal}
                disabled={billingPortalButtonDisabled}
              />
            </Section>
            <Section>
              <H2Title
                title="Cancel your subscription"
                description="Your workspace will be disabled"
              />
              <Button
                Icon={IconCircleX}
                title="Cancel Plan"
                variant="secondary"
                accent="danger"
                onClick={openBillingPortal}
                disabled={billingPortalButtonDisabled}
              />
            </Section>
          </>
        )}
      </SettingsPageContainer>
      <StyledInvisibleChat>
        <SupportChat />
      </StyledInvisibleChat>
      <ConfirmationModal
        isOpen={isSwitchingToYearlyModalOpen}
        setIsOpen={setIsSwitchingToYearlyModalOpen}
        title="Switch billing to yearly"
        subtitle={
          <>
            Are you sure that you want to change your billing interval to
            yearly? You will be charged immediately for the full year.
          </>
        }
        onConfirmClick={switchToYearly}
        deleteButtonText="Change"
        confirmButtonAccent={'blue'}
      />
    </SubMenuTopBarContainer>
  );
};
