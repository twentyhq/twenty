import { useCallback, useEffect, useState } from 'react';

import { Title } from '@/auth/components/Title';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { CHANGE_SUBSCRIPTION_MODAL_ID } from '@/settings/billing/constants/ChangeSubscriptionModalId';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { atom, useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { MainButton } from 'twenty-ui/input';
import { z } from 'zod';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useGetAllBillingPlan } from '~/pages/onboarding/hooks/useGetAllBillingPlan';
import { useUpdateBillingPlan } from '~/pages/onboarding/hooks/useUpdateBillingPlan';

export type Plans = {
  id: string;
  title: string;
  price: number;
  displayPrice: string;
  type: string;
  features: string[];
};

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

const StyledPlanLabel = styled.label`
  cursor: pointer;
  position: relative;
`;

const StyledPlanRadio = styled.input`
  display: none;
`;

const StyledPlanOptionContainer = styled.div<{ selected: boolean }>`
  background-color: ${({ theme }) => theme.color.gray};
  border: 2px solid ${({ theme }) => theme.color.gray40};
  border-radius: 8px;
  padding: 1rem;
  transition: 0.2s;
  width: 150px;
`;

const StyledIndicator = styled.div<{ selected: boolean }>`
  background-color: ${({ selected, theme }) =>
    selected ? theme.color.blue50 : 'transparent'};
  border: 2px solid ${({ theme }) => theme.color.gray30};
  border-radius: 50%;
  position: absolute;
  right: 10px;
  top: 10px;
  width: 16px;
  height: 16px;
`;

const StyledPrice = styled.div`
  color: ${({ theme }) => theme.color.gray70};
  font-size: 1.5rem;
  font-weight: bold;
  span {
    color: ${({ theme }) => theme.color.gray60};
    font-size: 0.9rem;
    font-weight: normal;
  }
`;

const StyledPlanTitle = styled.h3`
  color: ${({ theme }) => theme.color.gray60};
  margin: 0;
  padding-bottom: 5px;
`;

const StyledDescription = styled.p`
  color: ${({ theme }) => theme.color.gray70};
  font-size: 0.9rem;
`;

const StyledFeaturesList = styled.ul`
  background-color: ${({ theme }) => theme.color.gray};
  border: 2px solid ${({ theme }) => theme.color.gray40};
  border-radius: 8px;
  margin-top: 1.5rem;
  text-align: left;
  list-style: none;
  padding: 0;
  width: 94%;

  li {
    color: ${({ theme }) => theme.color.gray60};
    padding: 1rem;
  }
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  width: 100%;

  p {
    color: ${({ theme }) => theme.color.gray50};
    font-size: 0.8rem;
  }
`;

export const selectedPlanState = atom<Plans | string>({
  key: 'selectedPlanState',
  default: '',
});

export const ChangeSubscriptionPlan = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { enqueueSnackBar } = useSnackBar();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [selectedPlan, setSelectedPlan] = useRecoilState(selectedPlanState);
  const [onboardingPlans, setOnboardingPlans] = useState<Plans[]>([]);

  useEffect(() => {
    const fetchOnboardingPlans = async () => {
      try {
        const response = await fetch(
          `${REACT_APP_SERVER_BASE_URL}/onboarding-plans`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        const data = await response.json();

        setOnboardingPlans(data);
      } catch (error) {
        throw new Error(
          `Failed to fetch plans: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    fetchOnboardingPlans();
  }, []);

  useEffect(() => {
    if (onboardingPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(onboardingPlans[0].id);
    }
  }, [onboardingPlans]);

  const onboardingId = (selectedPlan as Plans)?.id;

  const planSchema = z.object({
    selectedPlanId: z.string().min(1, 'select a valid plan'),
  });

  const { updatePlan, loading } = useUpdateBillingPlan();

  const { billinPlan, refetchBillingPlan } = useGetAllBillingPlan();

  type Form = z.infer<typeof planSchema>;

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = useForm<Form>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { selectedPlanId: onboardingId },
    resolver: zodResolver(planSchema),
  });

  console.log('plan', billinPlan);

  const onSubmit: SubmitHandler<Form> = useCallback(async () => {
    planSchema.parse({ selectedPlanId: (selectedPlan as Plans)?.id });

    enqueueSnackBar('Subscription changed!', {
      variant: SnackBarVariant.Success,
    });

    handleCloseModal();
  }, [planSchema, enqueueSnackBar]);

  const [isEditingMode, setIsEditingMode] = useState(false);

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (isEditingMode) {
        onSubmit(getValues());
      }
    },
    PageHotkeyScope.PlanRequired,
  );

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const { closeModal, openModal } = useModal();

  const handleCloseModal = async () => {
    closeModal('change-subscription-plan-modal');
    closeModal('confirm-change-subscription-plan-modal');
  };

  openModal(CHANGE_SUBSCRIPTION_MODAL_ID);

  return (
    <Modal
      modalId={CHANGE_SUBSCRIPTION_MODAL_ID}
      size="large"
      className="custom-modal"
    >
      <style>{`
        .custom-modal {
          width: 70% !important;
        }
      `}</style>

      <Modal.Content isVerticalCentered isHorizontalCentered>
        <Title>
          <Trans>Choose your plan</Trans>
        </Title>

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {onboardingPlans.map((plan) => (
            <StyledPlanLabel key={plan.id}>
              <Controller
                name="selectedPlanId"
                control={control}
                render={({ field }) => (
                  <>
                    <StyledPlanRadio
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={field.value === plan.id}
                      onChange={() => {
                        field.onChange(plan.id);
                        setSelectedPlan(plan);
                      }}
                    />
                    <StyledPlanOptionContainer
                      selected={field.value === plan.id}
                    >
                      <StyledIndicator selected={field.value === plan.id} />

                      <StyledPlanTitle>{plan.title}</StyledPlanTitle>
                      <StyledPrice>
                        {formatPrice(plan.price)} <span>/ month</span>
                      </StyledPrice>
                      <StyledDescription>{plan.type}</StyledDescription>
                    </StyledPlanOptionContainer>
                  </>
                )}
              />
            </StyledPlanLabel>
          ))}
        </div>

        <StyledFeaturesList>
          {onboardingPlans
            .find((p) => p.id === (selectedPlan as Plans)?.id)
            ?.features.map((feat, i) => <li key={i}>✔ {feat}</li>)}
        </StyledFeaturesList>

        <StyledButtonContainer>
          <MainButton
            title={t`Save`}
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
            fullWidth
          />
        </StyledButtonContainer>
      </Modal.Content>
    </Modal>
  );
};
