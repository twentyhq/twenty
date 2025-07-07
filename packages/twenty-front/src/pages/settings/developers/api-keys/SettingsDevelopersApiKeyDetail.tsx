import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { ApiKeyNameInput } from '@/settings/developers/components/ApiKeyNameInput';
import { apiKeyTokenFamilyState } from '@/settings/developers/states/apiKeyTokenFamilyState';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { computeNewExpirationDate } from '@/settings/developers/utils/computeNewExpirationDate';
import { formatExpiration } from '@/settings/developers/utils/formatExpiration';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { H2Title, IconRepeat, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useGenerateApiKeyTokenMutation } from '~/generated-metadata/graphql';
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

const DELETE_API_KEY_MODAL_ID = 'delete-api-key-modal';
const REGENERATE_API_KEY_MODAL_ID = 'regenerate-api-key-modal';

export const SettingsDevelopersApiKeyDetail = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigateSettings();
  const { apiKeyId = '' } = useParams();

  const apiKeyToken = useRecoilValue(apiKeyTokenFamilyState(apiKeyId));

  const setApiKeyTokenCallback = useRecoilCallback(
    ({ set }) =>
      (apiKeyId: string, token: string) => {
        set(apiKeyTokenFamilyState(apiKeyId), token);
      },
    [],
  );

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
        navigate(SettingsPath.APIs);
      }
    } catch (err) {
      enqueueErrorSnackBar({ message: t`Error deleting api key.` });
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
          setApiKeyTokenCallback(apiKey.id, apiKey.token);
          navigate(SettingsPath.ApiKeyDetail, {
            apiKeyId: apiKey.id,
          });
        }
      }
    } catch (err) {
      enqueueErrorSnackBar({
        message: t`Error regenerating api key.`,
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
              children: t`APIs`,
              href: getSettingsPath(SettingsPath.APIs),
            },
            { children: t`${apiKeyName}` },
          ]}
        >
          <SettingsPageContainer>
            <Section>
              {apiKeyToken ? (
                <>
                  <H2Title
                    title={t`API Key`}
                    description={t`Copy this key as it will not be visible again`}
                  />
                  <ApiKeyInput apiKey={apiKeyToken} />
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
                      onClick={() => openModal(REGENERATE_API_KEY_MODAL_ID)}
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
                instanceId={`api-key-expiration-${apiKeyData?.id}`}
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
                onClick={() => openModal(DELETE_API_KEY_MODAL_ID)}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalId={DELETE_API_KEY_MODAL_ID}
        title={t`Delete API key`}
        subtitle={
          <Trans>
            Please type {`"${confirmationValue}"`} to confirm you want to delete
            this API Key. Be aware that any script using this key will stop
            working.
          </Trans>
        }
        onConfirmClick={deleteIntegration}
        confirmButtonText={t`Delete`}
        loading={isLoading}
      />
      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalId={REGENERATE_API_KEY_MODAL_ID}
        title={t`Regenerate an API key`}
        subtitle={
          <Trans>
            If you’ve lost this key, you can regenerate it, but be aware that
            any script using this key will need to be updated. Please type
            {`"${confirmationValue}"`} to confirm.
          </Trans>
        }
        onConfirmClick={regenerateApiKey}
        confirmButtonText={t`Regenerate key`}
        loading={isLoading}
      />
    </>
  );
};
