import React, { useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { SubscriptionBenefit } from '@/billing/components/SubscriptionBenefit';
import { SubscriptionCard } from '@/billing/components/SubscriptionCard';
import { billingState } from '@/client-config/states/billingState';
import { AppPath } from '@/types/AppPath';
import { Loader } from '@/ui/feedback/loader/components/Loader';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { CardPicker } from '@/ui/input/components/CardPicker';
import { ActionLink } from '@/ui/navigation/link/components/ActionLink';
import { CAL_LINK } from '@/ui/navigation/link/constants/Cal';
import {
  ProductPriceEntity,
  SubscriptionInterval,
  useCheckoutSessionMutation,
  useGetProductPricesQuery,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const StyledChoosePlanContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(8)} 0
    ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledBenefitsContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledLinkGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(4)};

  > span {
    background-color: ${({ theme }) => theme.font.color.light};
    border-radius: 50%;
    height: 2px;
    width: 2px;
  }
`;

const benefits = [
  'Acesso Completo',
  'Contatos Ilimitados',
  'Integração de E-mail',
  'Objetos Personalizados',
  'API e Webhooks',
  'Atualizações Frequentes',
  'E muito mais',
];

export const ChooseYourPlan = () => {
  const billing = useRecoilValue(billingState);

  const [planSelected, setPlanSelected] = useState(SubscriptionInterval.Month);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { enqueueSnackBar } = useSnackBar();

  const { data: prices } = useGetProductPricesQuery({
    variables: { product: 'base-plan' },
  });

  const [checkoutSession] = useCheckoutSessionMutation();

  const handlePlanChange = (type?: SubscriptionInterval) => {
    return () => {
      if (isNonEmptyString(type) && planSelected !== type) {
        setPlanSelected(type);
      }
    };
  };

  const { signOut } = useAuth();

  const computeInfo = (
    price: ProductPriceEntity,
    prices: ProductPriceEntity[],
  ): string => {
    if (price.recurringInterval !== SubscriptionInterval.Year) {
      return 'Cancele quando quiser';
    }
    const monthPrice = prices.filter(
      (price) => price.recurringInterval === SubscriptionInterval.Month,
    )?.[0];
    if (
      isDefined(monthPrice) &&
      isNumber(monthPrice.unitAmount) &&
      monthPrice.unitAmount > 0 &&
      isNumber(price.unitAmount) &&
      price.unitAmount > 0
    ) {
      return `Economize US$${(12 * monthPrice.unitAmount - price.unitAmount) / 100}`;
    }
    return 'Cancele quando quiser';
  };

  const handleButtonClick = async () => {
    setIsSubmitting(true);
    const { data } = await checkoutSession({
      variables: {
        recurringInterval: planSelected,
        successUrlPath: AppPath.PlanRequiredSuccess,
      },
    });
    setIsSubmitting(false);
    if (!data?.checkoutSession.url) {
      enqueueSnackBar(
        'Erro na sessão de pagamento. Por favor, tente novamente ou entre em contato com a equipe Digito Service',
        {
          variant: SnackBarVariant.Error,
        },
      );
      return;
    }
    window.location.replace(data.checkoutSession.url);
  };

  return (
    prices?.getProductPrices?.productPrices && (
      <>
        <Title noMarginTop>Escolha seu plano</Title>
        <SubTitle>
          Aproveite uma avaliação gratuita de {billing?.billingFreeTrialDurationInDays} dias
        </SubTitle>
        <StyledChoosePlanContainer>
          {prices.getProductPrices.productPrices.map((price, index) => (
            <CardPicker
              checked={price.recurringInterval === planSelected}
              handleChange={handlePlanChange(price.recurringInterval)}
              key={index}
            >
              <SubscriptionCard
                type={price.recurringInterval === SubscriptionInterval.Month ? 'Mês' : 'Ano'}
                price={price.unitAmount / 100}
                info={computeInfo(price, prices.getProductPrices.productPrices)}
              />
            </CardPicker>
          ))}
        </StyledChoosePlanContainer>
        <StyledBenefitsContainer>
          {benefits.map((benefit, index) => (
            <SubscriptionBenefit key={index}>{benefit}</SubscriptionBenefit>
          ))}
        </StyledBenefitsContainer>
        <MainButton
          title="Continuar"
          onClick={handleButtonClick}
          width={200}
          Icon={() => isSubmitting && <Loader />}
          disabled={isSubmitting}
        />
        <StyledLinkGroup>
          <ActionLink onClick={signOut}>Sair</ActionLink>
          <span />
          <ActionLink href={CAL_LINK} target="_blank" rel="noreferrer">
            Agende uma Ligação
          </ActionLink>
        </StyledLinkGroup>
      </>
    )
  );
};
