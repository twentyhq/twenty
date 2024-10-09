import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  H2Title,
  IconCalendarEvent,
  IconCircleX,
  IconCreditCard,
} from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingCoverImage } from '@/billing/components/SettingsBillingCoverImage';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { Info } from '@/ui/display/info/components/Info';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import {
  OnboardingStatus,
  SubscriptionInterval,
  SubscriptionStatus,
  useBillingPortalSessionQuery,
  useUpdateBillingSubscriptionMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

type SwitchInfo = {
  newInterval: SubscriptionInterval;
  to: string;
  from: string;
  impact: string;
};

const MONTHLY_SWITCH_INFO: SwitchInfo = {
  newInterval: SubscriptionInterval.Year,
  to: 'to yearly',
  from: 'from monthly to yearly',
  impact: 'You will be charged immediately for the full year.',
};

const YEARLY_SWITCH_INFO: SwitchInfo = {
  newInterval: SubscriptionInterval.Month,
  to: 'to monthly',
  from: 'from yearly to monthly',
  impact: 'Your credit balance will be used to pay the monthly bills.',
};

const SWITCH_INFOS = {
  year: YEARLY_SWITCH_INFO,
  month: MONTHLY_SWITCH_INFO,
};

export const SettingsBilling = () => {
  const { enqueueSnackBar } = useSnackBar();
  const onboardingStatus = useOnboardingStatus();
  const subscriptionStatus = useSubscriptionStatus();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const switchingInfo =
    currentWorkspace?.currentBillingSubscription?.interval ===
    SubscriptionInterval.Year
      ? SWITCH_INFOS.year
      : SWITCH_INFOS.month;
  const [isSwitchingIntervalModalOpen, setIsSwitchingIntervalModalOpen] =
    useState(false);
  const [updateBillingSubscription] = useUpdateBillingSubscriptionMutation();
  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
  });

  const billingPortalButtonDisabled =
    loading || !isDefined(data) || !isDefined(data.billingPortalSession.url);

  const switchIntervalButtonDisabled =
    onboardingStatus !== OnboardingStatus.Completed;

  const cancelPlanButtonDisabled =
    billingPortalButtonDisabled ||
    onboardingStatus !== OnboardingStatus.Completed;

  const displayPaymentFailInfo =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;

  const displaySubscriptionCanceledInfo =
    subscriptionStatus === SubscriptionStatus.Canceled;

  const displaySubscribeInfo =
    onboardingStatus === OnboardingStatus.Completed &&
    !isDefined(subscriptionStatus);

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      window.location.replace(data.billingPortalSession.url);
    }
  };

  const openSwitchingIntervalModal = () => {
    setIsSwitchingIntervalModalOpen(true);
  };

  const switchInterval = async () => {
    try {
      await updateBillingSubscription();
      if (isDefined(currentWorkspace?.currentBillingSubscription)) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription: {
            ...currentWorkspace?.currentBillingSubscription,
            interval: switchingInfo.newInterval,
          },
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
      enqueueSnackBar(`Subscription has been switched ${switchingInfo.to}`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error: any) {
      enqueueSnackBar(
        `Error while switching subscription ${switchingInfo.to}.`,
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  return (
    <SubMenuTopBarContainer
      title="Billing"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Billing' },
      ]}
    >
      <SettingsPageContainer>
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
            to={AppPath.PlanRequired}
          />
        )}
        {displaySubscribeInfo ? (
          <Info
            text={'Your workspace does not have an active subscription'}
            buttonTitle={'Subscribe'}
            accent={'danger'}
            to={AppPath.PlanRequired}
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
                disabled={billingPortalButtonDisabled}
              />
            </Section>
            <Section>
              <H2Title
                title="Edit billing interval"
                description={`Switch ${switchingInfo.from}`}
              />
              <Button
                Icon={IconCalendarEvent}
                title={`Switch ${switchingInfo.to}`}
                variant="secondary"
                onClick={openSwitchingIntervalModal}
                disabled={switchIntervalButtonDisabled}
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
                disabled={cancelPlanButtonDisabled}
              />
            </Section>
          </>
        )}
      </SettingsPageContainer>
      <ConfirmationModal
        isOpen={isSwitchingIntervalModalOpen}
        setIsOpen={setIsSwitchingIntervalModalOpen}
        title={`Switch billing ${switchingInfo.to}`}
        subtitle={
          <>
            {`Are you sure that you want to change your billing interval? 
            ${switchingInfo.impact}`}
          </>
        }
        onConfirmClick={switchInterval}
        deleteButtonText={`Change ${switchingInfo.to}`}
        confirmButtonAccent={'blue'}
      />
    </SubMenuTopBarContainer>
  );
};
