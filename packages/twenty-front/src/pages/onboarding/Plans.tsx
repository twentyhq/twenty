import React, { useCallback, useState } from 'react';

import { Title } from '@/auth/components/Title';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useRecoilState, atom } from 'recoil';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { z } from 'zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Key } from 'ts-key-enum';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';

export const plans = [
  {
    id: 1,
    title: 'Plan 1',
    price: 900,
    displayPrice: '$9',
    type: 'Prepaid',
    features: [
      '4 extensions',
      '2 simultaneous calls',
      'Chats & Omnichannel',
      'Full access CRM',
      'Unlimited contacts',
      'Stripe, WhatsApp Meta API e Zapier',
    ],
  },
  {
    id: 2,
    title: 'Plan 2',
    price: 9000,
    displayPrice: '$90',
    type: 'Postpaid',
    features: [
      'All from Plan 1',
      'Email integration',
      'Custom Objects',
      'API & Webhooks',
    ],
  },
  {
    id: 3,
    title: 'Plan 3',
    price: 9000,
    displayPrice: '$90',
    type: 'Postpaid',
    features: [
      'All from Plan 1',
      'Email integration',
      'Custom Objects',
      'API & Webhooks',
    ],
  },
  {
    id: 4,
    title: 'Plan 4',
    price: 9000,
    displayPrice: '$90',
    type: 'Postpaid',
    features: [
      'All from Plan 1',
      'Email integration',
      'Custom Objects',
      'API & Webhooks',
    ],
  },
];

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

export const selectedPlanState = atom<number>({
  key: 'selectedPlanState',
  default: 0,
});

export const Plans = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { enqueueSnackBar } = useSnackBar();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [selectedPlan, setSelectedPlan] = useRecoilState(selectedPlanState);

  const planSchema = z.object({
    selectedPlanId: z.number().min(1, 'select a valid plan'),
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
    defaultValues: { selectedPlanId: selectedPlan },
    resolver: zodResolver(planSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        planSchema.parse({ selectedPlanId: selectedPlan });

        if (!currentWorkspaceMember?.id) {
          throw new Error('User is not logged in');
        }

        setSelectedPlan(data.selectedPlanId);
        setNextOnboardingStatus();
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: SnackBarVariant.Error,
        });
      }
    },
    [
      planSchema,
      selectedPlan,
      currentWorkspaceMember?.id,
      setSelectedPlan,
      setNextOnboardingStatus,
      enqueueSnackBar,
    ],
  );

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

  return (
    <Modal size="large" className="custom-modal">
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
          {plans.map((plan) => (
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
                        setSelectedPlan(plan.id);
                      }}
                    />
                    <StyledPlanOptionContainer
                      selected={field.value === plan.id}
                    >
                      <StyledIndicator selected={field.value === plan.id} />

                      <StyledPlanTitle>{plan.title}</StyledPlanTitle>
                      <StyledPrice>
                        {plan.displayPrice} <span>/ month</span>
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
          {plans
            .find((p) => p.id === selectedPlan)
            ?.features.map((feat, i) => <li key={i}>✔ {feat}</li>)}
        </StyledFeaturesList>

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
          <p>Log out</p>
          <p>.</p>
          <p>Book a Call</p>
        </StyledFooterContainer>
      </Modal.Content>
    </Modal>
  );
};
