import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';

import { ConfigVariableInput } from '@/settings/admin-panel/components/ConfigVariableInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { isDefined } from 'twenty-shared/utils';
import { IconEye, IconEyeOff } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
    ConfigSource,
    useCreateDatabaseConfigVariableMutation,
    useGetDatabaseConfigVariableQuery,
    useUpdateDatabaseConfigVariableMutation,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledBadge = styled.div<{ type: string }>`
  background-color: ${({ theme, type }) =>
    type === 'DATABASE'
      ? theme.color.blue10
      : type === 'ENVIRONMENT'
        ? theme.color.green10
        : theme.color.gray10};
  color: ${({ theme, type }) =>
    type === 'DATABASE'
      ? theme.color.blue50
      : type === 'ENVIRONMENT'
        ? theme.color.green50
        : theme.color.gray50};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(0.5, 1.5)};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledSection = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

const StyledEyeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledHelpText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type FormValues = {
  value: string;
};

interface ConfigVariableWithTypes {
  __typename?: 'ConfigVariable' | undefined;
  name: string;
  description: string;
  value: string;
  isSensitive: boolean;
  isEnvOnly: boolean;
  type?: string;
  options?: any;
  source: ConfigSource;
}

export const SettingsAdminEnvVariableDetails = () => {
  const { variableName } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const [showSensitiveValue, setShowSensitiveValue] = useState(false);
  const { t } = useLingui();

  const { data, loading } = useGetDatabaseConfigVariableQuery({
    variables: { key: variableName as string },
    fetchPolicy: 'network-only',
  });

  const [updateDatabaseConfigVariable] =
    useUpdateDatabaseConfigVariableMutation();
  const [createDatabaseConfigVariable] =
    useCreateDatabaseConfigVariableMutation();

  const variable = data?.getDatabaseConfigVariable as
    | ConfigVariableWithTypes
    | undefined;

  const validationSchema = z.object({
    value: z.string(),
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    values: isDefined(variable) ? { value: variable.value } : { value: '' },
  });

  if (loading === true) {
    return (
      <SettingsPageContainer>
        <div>Loading...</div>
      </SettingsPageContainer>
    );
  }

  const isEnvOnly = variable?.isEnvOnly ?? false;
  const isFromDatabase = variable?.source === ConfigSource.DATABASE;
  const displayValue =
    variable?.isSensitive && !showSensitiveValue
      ? '••••••••••'
      : variable?.value;

  const handleToggleVisibility = () => {
    setShowSensitiveValue(!showSensitiveValue);
  };

  const onSubmit = async (formData: FormValues) => {
    if (!variable) return;

    try {
      if (isFromDatabase) {
        await updateDatabaseConfigVariable({
          variables: {
            key: variable.name,
            value: formData.value,
          },
          refetchQueries: ['GetDatabaseConfigVariable'],
        });
      } else {
        await createDatabaseConfigVariable({
          variables: {
            key: variable.name,
            value: formData.value,
          },
          refetchQueries: ['GetDatabaseConfigVariable'],
        });
      }

      enqueueSnackBar(t`Variable updated successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(t`Failed to update variable`, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const handleRemoveOverride = async () => {
    if (!isFromDatabase || !variable) return;

    try {
      await updateDatabaseConfigVariable({
        variables: {
          key: variable.name,
          value: '',
        },
        refetchQueries: ['GetDatabaseConfigVariable'],
      });

      enqueueSnackBar(t`Database override removed successfully`, {
        variant: SnackBarVariant.Success,
      });

      navigate(getSettingsPath(SettingsPath.AdminPanel));
    } catch (error) {
      enqueueSnackBar(t`Failed to remove override`, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`Environment Variable`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Environment Variable`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: variable?.name || variableName,
        },
      ]}
    >
      <SettingsPageContainer>
        <StyledContainer>
          <StyledHeader>
            <div>
              <StyledTitle>{variable?.name || variableName}</StyledTitle>
              <StyledDescription>{variable?.description}</StyledDescription>
            </div>
            <StyledBadge type={variable?.source || ''}>
              {variable?.source || 'UNKNOWN'}
            </StyledBadge>
          </StyledHeader>

          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <StyledSection>
              <StyledInputContainer>
                <StyledLabel>{t`Current Value`}</StyledLabel>
                <StyledRow>
                  <TextInput
                    value={displayValue ?? ''}
                    readOnly
                    fullWidth
                    disabled={variable?.value === ''}
                  />
                  {variable?.isSensitive && variable?.value !== '' && (
                    <StyledEyeButton
                      type="button"
                      onClick={handleToggleVisibility}
                    >
                      {showSensitiveValue ? (
                        <IconEyeOff size={16} />
                      ) : (
                        <IconEye size={16} />
                      )}
                    </StyledEyeButton>
                  )}
                </StyledRow>
              </StyledInputContainer>

              <StyledInputContainer>
                <StyledLabel>{t`Database Override Value`}</StyledLabel>
                <ConfigVariableInput
                  value={watch('value')}
                  onChange={(value) => setValue('value', value)}
                  type={variable?.type}
                  options={variable?.options}
                  disabled={isEnvOnly}
                  placeholder={
                    variable?.source === ConfigSource.ENVIRONMENT
                      ? t`Override environment value`
                      : t`Set a database value`
                  }
                />
              </StyledInputContainer>

              {isEnvOnly && (
                <StyledHelpText>
                  {t`This variable can only be set in the environment and cannot be overridden in the database.`}
                </StyledHelpText>
              )}

              {!isEnvOnly && (
                <StyledHelpText>
                  {t`Setting a value here will store it in the database and override any environment variable with the same name.`}
                </StyledHelpText>
              )}

              {variable?.source === ConfigSource.DATABASE && (
                <StyledHelpText>
                  {t`To remove the database override and fallback to the environment or default value, clear the field or use the "Remove Override" button.`}
                </StyledHelpText>
              )}
            </StyledSection>

            <StyledButtonContainer>
              {variable?.source === ConfigSource.DATABASE && (
                <Button
                  title={t`Remove Override`}
                  variant="secondary"
                  onClick={handleRemoveOverride}
                />
              )}
              {!isEnvOnly && (
                <Button
                  title={isFromDatabase ? t`Update` : t`Create Override`}
                  type="submit"
                  disabled={isSubmitting}
                />
              )}
            </StyledButtonContainer>
          </StyledForm>
        </StyledContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
