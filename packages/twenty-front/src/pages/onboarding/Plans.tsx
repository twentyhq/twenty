import { useCallback, useEffect, useState } from 'react';

import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
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
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { MainButton } from 'twenty-ui/input';
import { ClickToActionLink } from 'twenty-ui/navigation';
import { z } from 'zod';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export type Plan = {
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

export const selectedPlanState = atom<Plan | string>({
  key: 'selectedPlanState',
  default: '',
});

const PLANS_MODAL_ID = 'plans-modal';

export const Plans = () => {
  const { t } = useLingui();
  const { signOut } = useAuth();
  const { openModal } = useModal();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [selectedPlan, setSelectedPlan] = useRecoilState(selectedPlanState);
  const [onboardingPlans, setOnboardingPlans] = useState<Plan[]>([]);

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
  }, [onboardingPlans, selectedPlan, setSelectedPlan]);

  const onboardingId = (selectedPlan as Plan)?.id;

  const planSchema = z.object({
    selectedPlanId: z.string().min(1, 'select a valid plan'),
  });

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

  const onSubmit: SubmitHandler<Form> = useCallback(async () => {
    try {
      planSchema.parse({ selectedPlanId: (selectedPlan as Plan)?.id });

      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }
      const dataToPayement = selectedPlan;
      setSelectedPlan(dataToPayement);
      setNextOnboardingStatus();
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  }, [
    planSchema,
    selectedPlan,
    currentWorkspaceMember?.id,
    setSelectedPlan,
    setNextOnboardingStatus,
    enqueueSnackBar,
  ]);

  const [isEditingMode] = useState(false);

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

  openModal(PLANS_MODAL_ID);

  return (
    <Modal size="large" className="custom-modal" modalId={PLANS_MODAL_ID}>
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
        {onboardingPlans && onboardingPlans.length > 0 && (
          <StyledFeaturesList>
            {onboardingPlans
              .find((p) => p.id === (selectedPlan as Plan)?.id)
              ?.features.map((feat, i) => <li key={i}>✔ {feat}</li>)}
          </StyledFeaturesList>
        )}
        <StyledButtonContainer>
          <MainButton
            title={t`Continue`}
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
            fullWidth
          />
        </StyledButtonContainer>

        <StyledFooterContainer>
          <ClickToActionLink onClick={signOut}>{t`Log out`}</ClickToActionLink>
          <p>.</p>
          <ClickToActionLink>Book a Call</ClickToActionLink>
        </StyledFooterContainer>
      </Modal.Content>
    </Modal>
  );
};
