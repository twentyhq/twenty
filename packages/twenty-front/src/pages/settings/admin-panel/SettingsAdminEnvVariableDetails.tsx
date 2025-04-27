import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';

import { ConfigVariableInput } from '@/settings/admin-panel/components/ConfigVariableInput';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import {
    H3Title,
    IconEye,
    IconEyeOff,
    IconPlus,
    IconRefreshDot,
    IconTrash,
    Status,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
    ConfigSource,
    useCreateDatabaseConfigVariableMutation,
    useDeleteDatabaseConfigVariableMutation,
    useGetConfigVariablesGroupedQuery,
    useUpdateDatabaseConfigVariableMutation,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

// is this how form are used in codebase?
// TODO : check for codebase patterns
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
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

const StyledHelpText = styled.div<{ color?: string }>`
  color: ${({ theme, color }) => color || theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

type FormValues = {
  value: string | number | boolean | string[] | null;
};

interface ConfigVariableWithTypes {
  __typename?: 'ConfigVariable' | undefined;
  name: string;
  description: string;
  value: string | number | boolean | string[] | null;
  isSensitive: boolean;
  isEnvOnly: boolean;
  type?: string;
  options?: any;
  source: ConfigSource;
}

export const SettingsAdminEnvVariableDetails = () => {
  const { variableName } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const [showSensitiveValue, setShowSensitiveValue] = useState(false);
  const { t } = useLingui();
  const theme = useTheme();

  const { data: configVariablesData, loading } =
    useGetConfigVariablesGroupedQuery({
      fetchPolicy: 'network-only',
    });

  const [updateDatabaseConfigVariable] =
    useUpdateDatabaseConfigVariableMutation();
  const [createDatabaseConfigVariable] =
    useCreateDatabaseConfigVariableMutation();

  const [deleteDatabaseConfigVariable] =
    useDeleteDatabaseConfigVariableMutation();

  const variable = configVariablesData?.getConfigVariablesGrouped.groups
    .flatMap((group) => group.variables)
    .find((v) => v.name === variableName) as
    | ConfigVariableWithTypes
    | undefined;

  const validationSchema = z.object({
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.null(),
    ]),
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

  if (loading || !isDefined(variable)) {
    return <SettingsSkeletonLoader />;
  }

  const isEnvOnly = variable.isEnvOnly;
  const isFromDatabase = variable.source === ConfigSource.DATABASE;
  const getDisplayValue = (
    value: string | number | boolean | string[] | null,
  ): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };
  const displayValue =
    variable.isSensitive && !showSensitiveValue
      ? '••••••••••'
      : getDisplayValue(variable.value);

  const handleToggleVisibility = () => {
    setShowSensitiveValue(!showSensitiveValue);
  };

  const currentValue = watch('value');
  const hasValueChanged = currentValue !== variable.value;
  const isValidOverride =
    !isEnvOnly &&
    hasValueChanged &&
    ((typeof currentValue === 'string' && currentValue.trim() !== '') ||
      typeof currentValue === 'boolean' ||
      typeof currentValue === 'number' ||
      (Array.isArray(currentValue) && currentValue.length > 0));

  const onSubmit = async (formData: FormValues) => {
    try {
      // If value is empty, null, or an empty array, treat as delete -- come back to this
      if (
        formData.value === null ||
        formData.value === '' ||
        (Array.isArray(formData.value) && formData.value.length === 0)
      ) {
        await deleteDatabaseConfigVariable({
          variables: { key: variable.name },
          refetchQueries: ['GetConfigVariablesGrouped'],
        });
        enqueueSnackBar(t`Database override removed successfully`, {
          variant: SnackBarVariant.Success,
        });
        return;
      }

      // Otherwise, update as normal (send native type)
      if (isFromDatabase) {
        await updateDatabaseConfigVariable({
          variables: {
            key: variable.name,
            value: formData.value,
          },
          refetchQueries: ['GetConfigVariablesGrouped'],
        });
      } else {
        await createDatabaseConfigVariable({
          variables: {
            key: variable.name,
            value: formData.value,
          },
          refetchQueries: ['GetConfigVariablesGrouped'],
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

  const handleRemoveOverride = async (e?: React.MouseEvent) => {
    if (isDefined(e)) {
      e.preventDefault();
    }

    if (!isFromDatabase) return;

    try {
      await deleteDatabaseConfigVariable({
        variables: {
          key: variable.name,
        },
        refetchQueries: ['GetConfigVariablesGrouped'],
      });

      enqueueSnackBar(t`Database override removed successfully`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(t`Failed to remove override`, {
        variant: SnackBarVariant.Error,
      });
    }
  };
  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Environment Variable`,
          href: getSettingsPath(
            SettingsPath.AdminPanel,
            undefined,
            undefined,
            'env-variables',
          ),
        },
        {
          children: variable.name,
        },
      ]}
      actionButton={
        <>
          {variable.source === ConfigSource.DATABASE && (
            <Button
              title={t`Remove Override`}
              variant="secondary"
              size="small"
              accent="danger"
              disabled={isSubmitting}
              onClick={handleRemoveOverride}
              type="submit"
              Icon={IconTrash}
            />
          )}
          {!isEnvOnly && (
            <Button
              title={isFromDatabase ? t`Update` : t`Create Override`}
              variant="primary"
              size="small"
              accent="blue"
              disabled={isSubmitting || !isValidOverride}
              onClick={handleSubmit(onSubmit)}
              type="submit"
              Icon={isFromDatabase ? IconRefreshDot : IconPlus}
            />
          )}
        </>
      }
    >
      <SettingsPageContainer>
        <StyledTitleContainer>
          <H3Title title={variable.name} />

          {variable.source === ConfigSource.DATABASE && (
            <Status color="blue" text="Database" weight="medium" />
          )}
          {variable.source === ConfigSource.ENVIRONMENT && (
            <Status color="green" text="Environment" weight="medium" />
          )}
          {variable.source === ConfigSource.DEFAULT && (
            <Status color="gray" text="Default" weight="medium" />
          )}
        </StyledTitleContainer>

        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <>
            <StyledInputContainer>
              <StyledLabel>{t`Current Value`}</StyledLabel>
              <StyledRow>
                <TextInput
                  value={displayValue}
                  readOnly
                  fullWidth
                  disabled={getDisplayValue(variable.value) === ''}
                />
                {variable.isSensitive &&
                  variable.value !== null &&
                  variable.value !== undefined && (
                    <StyledEyeButton
                      type="button"
                      onClick={handleToggleVisibility}
                    >
                      {showSensitiveValue ? (
                        <IconEyeOff size={theme.icon.size.md} />
                      ) : (
                        <IconEye size={theme.icon.size.md} />
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
                type={variable.type}
                options={variable.options}
                disabled={isEnvOnly}
                placeholder={
                  isEnvOnly
                    ? t`This variable cannot be overridden`
                    : isFromDatabase
                      ? t`Current database value`
                      : t`Enter value to override environment variable`
                }
              />
              {!isEnvOnly && hasValueChanged && (
                <StyledHelpText color={theme.color.blue50}>
                  {isFromDatabase
                    ? t`Value has been changed. Click Update to save.`
                    : t`Value will override the environment variable.`}
                </StyledHelpText>
              )}
            </StyledInputContainer>

            {isEnvOnly && (
              <StyledHelpText>
                {t`This variable can only be set in the environment and cannot be overridden in the database.`}
              </StyledHelpText>
            )}

            {!isEnvOnly && !hasValueChanged && (
              <StyledHelpText>
                {isFromDatabase
                  ? t`This value is currently stored in the database and overrides any environment variable with the same name.`
                  : t`Enter a value above to create a database override for this environment variable.`}
              </StyledHelpText>
            )}

            {variable.source === ConfigSource.DATABASE && (
              <StyledHelpText>
                {t`To remove the database override and fallback to the environment or default value, clear the field or use the "Remove Override" button.`}
              </StyledHelpText>
            )}
          </>
        </StyledForm>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
