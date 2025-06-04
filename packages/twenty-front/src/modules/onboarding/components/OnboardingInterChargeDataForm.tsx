import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { HandleCheckoutSessionFn } from '@/billing/hooks/useHandleCheckoutSession';
import { INTER_STATE_UNITY_OPTIONS } from '@/onboarding/constants/OnboardingInterChargeDataStateUnityOptions';
import { InterCharteDataForm } from '@/onboarding/hooks/useInterChargeDataForm';
import { useInterCustomerTypeOptions } from '@/onboarding/hooks/useInterCustomerTypeOptions';
import {
  OnboardingPlanStep,
  onboardingPlanStepState,
} from '@/onboarding/states/onboardingPlanStepState';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { Select } from '@/ui/input/components/Select';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { H2Title } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { InterCustomerType } from '~/generated/graphql';
import { formatCnpj } from '~/utils/formatCnpj';
import { formatCpf } from '~/utils/formatCpf';
import { castToNumberString } from '~/utils/string/castToNumberString';
import { formatCEP } from '~/utils/string/formatCEP';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledContentContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  min-width: 200px;
`;

const StyledControlButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export type OnboardingInterChargeDataFormProps = {
  handleCheckoutSession: HandleCheckoutSessionFn;
  isLoading?: boolean;
};

export const OnboardingInterChargeDataForm = ({
  handleCheckoutSession,
  isLoading,
}: OnboardingInterChargeDataFormProps) => {
  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<InterCharteDataForm>();

  const { INTER_CUSTOMER_TYPE_OPTIONS } = useInterCustomerTypeOptions();

  const setOnboardingPlanStep = useSetRecoilState(onboardingPlanStepState);

  const { legalEntity } = watch();

  const { t } = useLingui();

  // TODO: Maybe set this outside?
  const [isEditingMode, setIsEditingMode] = useState(false);

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (isEditingMode) {
        // TODO Validate form here
        // onSubmit(getValues());
      }
    },
    PageHotkeyScope.PlanRequired,
  );

  const onSubmit = async (values: InterCharteDataForm) => {
    await handleCheckoutSession({
      ...values,
      cpfCnpj: castToNumberString(values.cpfCnpj),
      cep: castToNumberString(values.cep),
    });
  };

  return (
    <>
      <StyledContentContainer>
        <H2Title
          title={t`Payment data`}
          description={t`Theses are the necessary data to emit your bank slip`}
        />
        <StyledSectionContainer>
          <H2Title title={t`Personal Details`} />
          <Controller
            name="name"
            control={control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextInputV2
                autoFocus
                label={t`Full Name`}
                value={value}
                onFocus={() => setIsEditingMode(true)}
                onBlur={() => {
                  onBlur();
                  setIsEditingMode(false);
                }}
                onChange={onChange}
                placeholder="Tim Apple"
                error={error?.message}
                fullWidth
              />
            )}
          />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <StyledComboInputContainer>
            <Controller
              name="legalEntity"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  fullWidth
                  label={t`Legal entity`}
                  dropdownId="inter-charge-data-legal-entity"
                  value={value}
                  onChange={onChange}
                  options={INTER_CUSTOMER_TYPE_OPTIONS}
                />
              )}
            />
            <Controller
              name="cpfCnpj"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  label={
                    legalEntity === InterCustomerType.FISICA ? 'CPF' : 'CNPJ'
                  }
                  value={
                    legalEntity === InterCustomerType.FISICA
                      ? formatCpf(value)
                      : formatCnpj(value)
                  }
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder={
                    InterCustomerType.FISICA
                      ? '999.999.999-99'
                      : '99.999.999/9999-99'
                  }
                  maxLength={legalEntity === InterCustomerType.FISICA ? 14 : 18}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
          </StyledComboInputContainer>
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title title={t`Address`} />
          <StyledComboInputContainer>
            <Controller
              name="cep"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  label={t`CEP`}
                  value={formatCEP(value)}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder="XX.XXX-XXX"
                  maxLength={10}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  autoFocus
                  label={t`Address`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder="EX.: Rua, Av., Rodovia"
                  error={error?.message}
                  fullWidth
                />
              )}
            />
          </StyledComboInputContainer>
        </StyledSectionContainer>
        <StyledSectionContainer>
          <StyledComboInputContainer>
            <Controller
              name="stateUnity"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  label={t`UF`}
                  dropdownId="inter-charge-data-state-unity"
                  value={value}
                  onChange={onChange}
                  options={INTER_STATE_UNITY_OPTIONS}
                  fullWidth
                />
              )}
            />
            <Controller
              name="city"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  autoFocus
                  label={t`City`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder="EX.: Sorocaba"
                  error={error?.message}
                  fullWidth
                />
              )}
            />
          </StyledComboInputContainer>
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledControlButtonContainer>
        <MainButton
          title={t`Back`}
          onClick={() => setOnboardingPlanStep(OnboardingPlanStep.Init)}
          width={200}
          disabled={isSubmitting || isLoading}
          variant="secondary"
        />
        <MainButton
          title={t`Continue`}
          onClick={handleSubmit(onSubmit)}
          width={200}
          Icon={() => (isSubmitting || isLoading) && <Loader />}
          disabled={isSubmitting || isLoading}
        />
      </StyledControlButtonContainer>
    </>
  );
};
