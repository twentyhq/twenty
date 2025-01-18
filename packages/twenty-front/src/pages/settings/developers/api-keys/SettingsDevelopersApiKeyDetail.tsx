import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Button, H2Title, IconRepeat, IconTrash, Section } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { ApiKeyNameInput } from '@/settings/developers/components/ApiKeyNameInput';
import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { computeNewExpirationDate } from '@/settings/developers/utils/computeNewExpirationDate';
import { formatExpiration } from '@/settings/developers/utils/formatExpiration';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { useGenerateApiKeyTokenMutation } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledInfo = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsDevelopersApiKeyDetail = () => {
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();
  const [isRegenerateKeyModalOpen, setIsRegenerateKeyModalOpen] =
    useState(false);
  const [isDeleteApiKeyModalOpen, setIsDeleteApiKeyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigateSettings();
  const { apiKeyId = '' } = useParams();

  const [apiKeyToken, setApiKeyToken] = useRecoilState(apiKeyTokenState);
  const [generateOneApiKeyToken] = useGenerateApiKeyTokenMutation();
  const { createOneRecord: createOneApiKey } = useCreateOneRecord<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
  });
  const { updateOneRecord: updateApiKey } = useUpdateOneRecord<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
  });

  const [apiKeyName, setApiKeyName] = useState('');

  const { record: apiKeyData, loading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
    objectRecordId: apiKeyId,
    onCompleted: (record) => {
      setApiKeyName(record.name);
    },
  });

  const deleteIntegration = async (redirect = true) => {
    setIsLoading(true);

    try {
      await updateApiKey?.({
        idToUpdate: apiKeyId,
        updateOneRecordInput: { revokedAt: DateTime.now().toString() },
      });
      if (redirect) {
        navigate(SettingsPath.Developers);
      }
    } catch (err) {
      enqueueSnackBar(t`Error deleting api key: ${err}`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (
    name: string,
    newExpiresAt: string | null,
  ) => {
    const newApiKey = await createOneApiKey?.({
      name: name,
      expiresAt: newExpiresAt ?? '',
    });

    if (!newApiKey) {
      return;
    }

    const tokenData = await generateOneApiKeyToken({
      variables: {
        apiKeyId: newApiKey.id,
        expiresAt: newApiKey?.expiresAt,
      },
    });
    return {
      id: newApiKey.id,
      token: tokenData.data?.generateApiKeyToken.token,
    };
  };

  const regenerateApiKey = async () => {
    setIsLoading(true);
    try {
      if (isNonEmptyString(apiKeyData?.name)) {
        const newExpiresAt = computeNewExpirationDate(
          apiKeyData?.expiresAt,
          apiKeyData?.createdAt,
        );
        const apiKey = await createIntegration(apiKeyData?.name, newExpiresAt);
        await deleteIntegration(false);

        if (isNonEmptyString(apiKey?.token)) {
          setApiKeyToken(apiKey.token);
          navigate(SettingsPath.DevelopersApiKeyDetail, {
            apiKeyId: apiKey.id,
          });
        }
      }
    } catch (err) {
      enqueueSnackBar(t`Error regenerating api key: ${err}`, {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmationValue = t`yes`;

  return (
    <>
      {apiKeyData?.name && (
        <SubMenuTopBarContainer
          title={apiKeyData?.name}
          links={[
            {
              children: t`Workspace`,
              href: getSettingsPath(SettingsPath.Workspace),
            },
            {
              children: t`Developers`,
              href: getSettingsPath(SettingsPath.Developers),
            },
            { children: t`${apiKeyName} API Key` },
          ]}
        >
          <SettingsPageContainer>
            <Section>
              {apiKeyToken ? (
                <>
                  <H2Title
                    title={t`API Key`}
                    description={t`Copy this key as it will only be visible this one time`}
                  />
                  <ApiKeyInput apiKey={apiKeyToken} />
                  <StyledInfo>
                    {formatExpiration(apiKeyData?.expiresAt || '', true, false)}
                  </StyledInfo>
                </>
              ) : (
                <>
                  <H2Title
                    title={t`API Key`}
                    description={t`Regenerate an API key`}
                  />
                  <StyledInputContainer>
                    <Button
                      title={t`Regenerate Key`}
                      Icon={IconRepeat}
                      onClick={() => setIsRegenerateKeyModalOpen(true)}
                    />
                    <StyledInfo>
                      {formatExpiration(
                        apiKeyData?.expiresAt || '',
                        true,
                        false,
                      )}
                    </StyledInfo>
                  </StyledInputContainer>
                </>
              )}
            </Section>
            <Section>
              <H2Title title={t`Name`} description={t`Name of your API key`} />
              <ApiKeyNameInput
                apiKeyName={apiKeyName}
                apiKeyId={apiKeyData?.id}
                disabled={loading}
                onNameUpdate={setApiKeyName}
              />
            </Section>
            <Section>
              <H2Title
                title={t`Expiration`}
                description={t`When the key will be disabled`}
              />
              <TextInput
                placeholder={t`E.g. backoffice integration`}
                value={formatExpiration(
                  apiKeyData?.expiresAt || '',
                  true,
                  false,
                )}
                disabled
                fullWidth
              />
            </Section>
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this integration`}
              />
              <Button
                accent="danger"
                variant="secondary"
                title={t`Delete`}
                Icon={IconTrash}
                onClick={() => setIsDeleteApiKeyModalOpen(true)}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        isOpen={isDeleteApiKeyModalOpen}
        setIsOpen={setIsDeleteApiKeyModalOpen}
        title={t`Delete API key`}
        subtitle={
          <Trans>
            Please type {`"${confirmationValue}"`} to confirm you want to delete
            this API Key. Be aware that any script using this key will stop
            working.
          </Trans>
        }
        onConfirmClick={deleteIntegration}
        deleteButtonText="Delete"
        loading={isLoading}
      />
      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        isOpen={isRegenerateKeyModalOpen}
        setIsOpen={setIsRegenerateKeyModalOpen}
        title={t`Regenerate an API key`}
        subtitle={
          <Trans>
            If you’ve lost this key, you can regenerate it, but be aware that
            any script using this key will need to be updated. Please type
            {`"${confirmationValue}"`} to confirm.
          </Trans>
        }
        onConfirmClick={regenerateApiKey}
        deleteButtonText={t`Regenerate key`}
        loading={isLoading}
      />
    </>
  );
};
