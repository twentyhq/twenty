import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { H2Title, MainButton } from 'twenty-ui';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FormPhoneFieldInput } from '@/object-record/record-field/form-types/components/FormPhoneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { PERSON_TYPE_OPTIONS } from '@/settings/constants/PersonTypeOptions';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated/graphql';
import { formatCnpj } from '~/utils/formatCnpj';
import { formatCpf } from '~/utils/formatCpf';
import isCnpj from '~/utils/isCnpj';
import { validateCnpj } from '~/utils/validateCnpj';
import { validateCpf } from '~/utils/validateCpf';

const StyledContentContainer = styled.div`
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const validationSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First name can not be empty' }),
    lastName: z.string().min(1, { message: 'Last name can not be empty' }),
    personType: z.enum(['CPF', 'CNPJ']).default('CPF'),
    document: z
      .string()
      .min(1, { message: 'Document can not be empty' })
      .refine((value) => validateCpf(value) || validateCnpj(value), {
        message: 'Invalid Document',
      }),
    phone: z.object({
      primaryPhoneCountryCode: z.string().min(1),
      primaryPhoneCallingCode: z.string().min(1),
      primaryPhoneNumber: z.string().min(1),
      additionalPhones: z.null().default(null),
    }),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

export const CreateProfile = () => {
  const { t } = useLingui();
  const onboardingStatus = useOnboardingStatus();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const { enqueueSnackBar } = useSnackBar();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const { updateOneRecord } = useUpdateOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = useForm<Form>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: currentWorkspaceMember?.name?.firstName ?? '',
      lastName: currentWorkspaceMember?.name?.lastName ?? '',
      personType: isCnpj(currentWorkspaceMember?.userDocument) ? 'CNPJ' : 'CPF',
      document: isCnpj(currentWorkspaceMember?.userDocument)
        ? formatCnpj(currentWorkspaceMember?.userDocument || '')
        : formatCpf(currentWorkspaceMember?.userDocument || ''),
      phone: {
        ...currentWorkspaceMember?.userPhone,
        additionalPhones: null,
      },
    },
    resolver: zodResolver(validationSchema),
  });

  const personType = useWatch({ control, name: 'personType' });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        if (!currentWorkspaceMember?.id) {
          throw new Error('User is not logged in');
        }
        if (!data.firstName || !data.lastName) {
          throw new Error('First name or last name is missing');
        }

        await updateOneRecord({
          idToUpdate: currentWorkspaceMember?.id,
          updateOneRecordInput: {
            name: {
              firstName: data.firstName,
              lastName: data.lastName,
            },
            colorScheme: 'System',
            userDocument: data.document.replace(/\D/g, ''),
            userPhone: data.phone,
          },
        });

        setCurrentWorkspaceMember((current) => {
          if (isDefined(current)) {
            return {
              ...current,
              name: {
                firstName: data.firstName,
                lastName: data.lastName,
              },
              colorScheme: 'System',
              userDocument: data.document.replace(/\D/g, ''),
              userPhone: data.phone,
            };
          }
          return current;
        });
        setNextOnboardingStatus();
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: SnackBarVariant.Error,
        });
      }
    },
    [
      currentWorkspaceMember?.id,
      setNextOnboardingStatus,
      enqueueSnackBar,
      setCurrentWorkspaceMember,
      updateOneRecord,
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
    PageHotkeyScope.CreateProfile,
  );

  if (onboardingStatus !== OnboardingStatus.PROFILE_CREATION) {
    return null;
  }

  return (
    <>
      <Title noMarginTop>
        <Trans>Create profile</Trans>
      </Title>
      <SubTitle>
        <Trans>How you'll be identified on the app.</Trans>
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title="Picture" />
          <ProfilePictureUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title
            title={t`Name`}
            description={t`Your name as it will be displayed on the app`}
          />
          {/* TODO: When react-web-hook-form is added to edit page we should create a dedicated component with context */}
          <StyledComboInputContainer>
            <Controller
              name="firstName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  autoFocus
                  label={t`First Name`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder="Tim"
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  label={t`Last Name`}
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={onChange}
                  placeholder="Cook"
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
              name="personType"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormSelectFieldInput
                  label="Person type"
                  defaultValue={value}
                  onChange={onChange}
                  options={PERSON_TYPE_OPTIONS}
                />
              )}
            />
            <Controller
              name="document"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInputV2
                  label="Document"
                  value={value}
                  onFocus={() => setIsEditingMode(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEditingMode(false);
                  }}
                  onChange={(text) => {
                    personType === 'CNPJ'
                      ? onChange(formatCnpj(text))
                      : onChange(formatCpf(text));
                  }}
                  placeholder={
                    personType === 'CNPJ'
                      ? '99.999.999/9999-99'
                      : '999.999.999-99'
                  }
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
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormPhoneFieldInput
                  label="Phone"
                  defaultValue={value}
                  onChange={onChange}
                />
              )}
            />
          </StyledComboInputContainer>
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton
          title={t`Continue`}
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
};
