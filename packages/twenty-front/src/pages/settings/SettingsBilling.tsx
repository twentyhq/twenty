import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  H1Title,
  H2Title,
  IconCalendarEvent,
  IconCircleX,
  IconCreditCard,
  IconCurrencyDollar,
} from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingCoverImage } from '@/billing/components/SettingsBillingCoverImage';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
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

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

type SwitchInfo = {
  newInterval: SubscriptionInterval;
  to: string;
  from: string;
  impact: string;
};

const MONTHLY_SWITCH_INFO: SwitchInfo = {
  newInterval: SubscriptionInterval.Year,
  to: 'para anual',
  from: 'de mensal para anual',
  impact: 'Você será cobrado imediatamente pelo ano completo.',
};

const YEARLY_SWITCH_INFO: SwitchInfo = {
  newInterval: SubscriptionInterval.Month,
  to: 'para mensal',
  from: 'de anual para mensal',
  impact: 'Seu saldo de crédito será usado para pagar as faturas mensais.',
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
      enqueueSnackBar(`A assinatura foi alterada ${switchingInfo.to}`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error: any) {
      enqueueSnackBar(
        `Erro ao alterar a assinatura ${switchingInfo.to}.`,
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  return (
    <SubMenuTopBarContainer Icon={IconCurrencyDollar} title="Cobrança">
      <SettingsPageContainer>
        <StyledH1Title title="Cobrança" />
        <SettingsBillingCoverImage />
        {displayPaymentFailInfo && (
          <Info
            text={'Último pagamento falhou. Por favor, atualize seus dados de cobrança.'}
            buttonTitle={'Atualizar'}
            accent={'danger'}
            onClick={openBillingPortal}
          />
        )}
        {displaySubscriptionCanceledInfo && (
          <Info
            text={'Assinatura cancelada. Por favor, inicie uma nova.'}
            buttonTitle={'Assinar'}
            accent={'danger'}
            to={AppPath.PlanRequired}
          />
        )}
        {displaySubscribeInfo ? (
          <Info
            text={'Seu workspace não tem uma assinatura ativa'}
            buttonTitle={'Assinar'}
            accent={'danger'}
            to={AppPath.PlanRequired}
          />
        ) : (
          <>
            <Section>
              <H2Title
                title="Gerencie sua assinatura"
                description="Edite o método de pagamento, veja suas faturas e mais"
              />
              <Button
                Icon={IconCreditCard}
                title="Ver detalhes de cobrança"
                variant="secondary"
                onClick={openBillingPortal}
                disabled={billingPortalButtonDisabled}
              />
            </Section>
            <Section>
              <H2Title
                title="Editar intervalo de cobrança"
                description={`Mudar ${switchingInfo.from}`}
              />
              <Button
                Icon={IconCalendarEvent}
                title={`Mudar ${switchingInfo.to}`}
                variant="secondary"
                onClick={openSwitchingIntervalModal}
                disabled={switchIntervalButtonDisabled}
              />
            </Section>
            <Section>
              <H2Title
                title="Cancelar sua assinatura"
                description="Seu workspace será desativado"
              />
              <Button
                Icon={IconCircleX}
                title="Cancelar Plano"
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
        title={`Mudar cobrança ${switchingInfo.to}`}
        subtitle={
          <>
            {`Tem certeza de que deseja mudar o intervalo de cobrança? 
            ${switchingInfo.impact}`}
          </>
        }
        onConfirmClick={switchInterval}
        deleteButtonText={`Mudar ${switchingInfo.to}`}
        confirmButtonAccent={'blue'}
      />
    </SubMenuTopBarContainer>
  );
};
