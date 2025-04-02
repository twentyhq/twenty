import { useMutation, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { UPDATE_CONFIG_VAR } from '@/settings/admin-panel/graphql/mutations/updateConfigVar';
import { GET_CONFIG_VARS } from '@/settings/admin-panel/graphql/queries/getConfigVars';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import {
    Button,
    H1Title,
    IconEye,
    IconEyeOff,
    LightIconButton,
} from 'twenty-ui';
import { SettingsPath } from '~/modules/types/SettingsPath';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledFieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledValue = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-family: 'Courier New', Courier, monospace;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminEnvVarDetail = () => {
  const { envVarKey } = useParams();
  const { enqueueSnackBar } = useSnackBar();

  const { data, loading } = useQuery(GET_CONFIG_VARS, {
    fetchPolicy: 'network-only',
  });

  const [updateConfigVar, { loading: isUpdating }] = useMutation(
    UPDATE_CONFIG_VAR,
    {
      onCompleted: () => {
        enqueueSnackBar(t`Variable updated successfully`, {
          variant: SnackBarVariant.Success,
        });
      },
      onError: (error) => {
        enqueueSnackBar(t`Failed to update variable: ${error.message}`, {
          variant: SnackBarVariant.Error,
        });
      },
    },
  );

  const configVar = data?.configVars?.find((v: any) => v.key === envVarKey);

  const [newValue, setNewValue] = useState('');
  const [showSensitiveValue, setShowSensitiveValue] = useState(false);

  useEffect(() => {
    if (configVar !== undefined && configVar !== null) {
      setNewValue(configVar.value || '');
    }
  }, [configVar]);

  const handleSave = useCallback(() => {
    if (!configVar) return;

    updateConfigVar({
      variables: {
        input: {
          key: configVar.key,
          value: newValue,
        },
      },
    });
  }, [configVar, newValue, updateConfigVar]);

  if (loading) {
    return (
      <SubMenuTopBarContainer
        title={t`Environment Variable Detail`}
        links={[
          {
            children: t`Admin Panel`,
            href: getSettingsPath(SettingsPath.AdminPanel),
          },
          {
            children: t`Environment Variable`,
          },
        ]}
      >
        <SettingsPageContainer>
          <div>{t`Loading...`}</div>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  if (!configVar) {
    return (
      <SubMenuTopBarContainer
        title={t`Environment Variable Detail`}
        links={[
          {
            children: t`Admin Panel`,
            href: getSettingsPath(SettingsPath.AdminPanel),
          },
          {
            children: t`Environment Variable`,
          },
        ]}
      >
        <SettingsPageContainer>
          <div>{t`Variable not found`}</div>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  const displayValue =
    configVar.value === ''
      ? 'null'
      : configVar.metadata.sensitive && !showSensitiveValue
        ? '••••••'
        : configVar.value;

  const handleToggleVisibility = () => {
    setShowSensitiveValue(!showSensitiveValue);
  };

  return (
    <SubMenuTopBarContainer
      title={envVarKey}
      links={[
        {
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Environment Variables`,
          href: `${getSettingsPath(SettingsPath.AdminPanel)}#env-var-debug`,
        },
        {
          children: envVarKey,
        },
      ]}
    >
      <SettingsPageContainer>
        <StyledContentWrapper>
          <StyledSection>
            <H1Title title={t`Variable Details`} />

            <StyledFormSection>
              <StyledFieldRow>
                <StyledLabel>{t`Key`}</StyledLabel>
                <StyledValue>{configVar.key}</StyledValue>
              </StyledFieldRow>

              <StyledFieldRow>
                <StyledLabel>{t`Group`}</StyledLabel>
                <StyledValue>{configVar.metadata.group}</StyledValue>
              </StyledFieldRow>

              <StyledFieldRow>
                <StyledLabel>{t`Description`}</StyledLabel>
                <StyledValue>{configVar.metadata.description}</StyledValue>
              </StyledFieldRow>

              <StyledFieldRow>
                <StyledLabel>{t`Source`}</StyledLabel>
                <StyledValue>{configVar.source}</StyledValue>
              </StyledFieldRow>

              <StyledFieldRow>
                <StyledLabel>{t`Sensitive`}</StyledLabel>
                <StyledValue>
                  {configVar.metadata.sensitive ? 'Yes' : 'No'}
                </StyledValue>
              </StyledFieldRow>

              {!configVar.metadata.isEnvOnly && (
                <>
                  <StyledFieldRow>
                    <StyledLabel>{t`Current Value`}</StyledLabel>
                    <StyledValueContainer>
                      <StyledValue>{displayValue}</StyledValue>
                      {configVar.metadata.sensitive &&
                        configVar.value !== '' && (
                          <LightIconButton
                            Icon={showSensitiveValue ? IconEyeOff : IconEye}
                            size="small"
                            accent="secondary"
                            onClick={handleToggleVisibility}
                          />
                        )}
                    </StyledValueContainer>
                  </StyledFieldRow>

                  <StyledFieldRow>
                    <StyledLabel>{t`New Value`}</StyledLabel>
                    {typeof configVar.value === 'string' &&
                    (configVar.value.includes('\n') ||
                      configVar.value.length > 100) ? (
                      <TextArea
                        value={newValue}
                        onChange={(value) => setNewValue(value)}
                        placeholder={t`Enter new value`}
                        minRows={5}
                      />
                    ) : (
                      <TextInput
                        value={newValue}
                        onChange={(value) => setNewValue(value)}
                        placeholder={t`Enter new value`}
                      />
                    )}
                  </StyledFieldRow>

                  <StyledButtonContainer>
                    <Button
                      title={t`Save Changes`}
                      onClick={handleSave}
                      disabled={isUpdating}
                    />
                  </StyledButtonContainer>
                </>
              )}

              {configVar.metadata.isEnvOnly && (
                <StyledFieldRow>
                  <StyledLabel>{t`Note`}</StyledLabel>
                  <StyledValue>{t`This variable can only be set through environment variables and cannot be modified here.`}</StyledValue>
                </StyledFieldRow>
              )}
            </StyledFormSection>
          </StyledSection>
        </StyledContentWrapper>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
