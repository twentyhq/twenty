import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { H2Title, IconRepeat, IconSettings, IconTrash } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { ApiKeyNameInput } from '@/settings/developers/components/ApiKeyNameInput';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { computeNewExpirationDate } from '@/settings/developers/utils/compute-new-expiration-date';
import { formatExpiration } from '@/settings/developers/utils/format-expiration';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useGenerateApiKeyTokenMutation } from '~/generated/graphql';
import { apiKeyTokenState } from '@/settings/developers/states/generatedApiKeyTokenState';

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
  const [isRegenerateKeyModalOpen, setIsRegenerateKeyModalOpen] =
    useState(false);
  const [isDeleteApiKeyModalOpen, setIsDeleteApiKeyModalOpen] = useState(false);

  const navigate = useNavigate();
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
    await updateApiKey?.({
      idToUpdate: apiKeyId,
      updateOneRecordInput: { revokedAt: DateTime.now().toString() },
    });
    if (redirect) {
      navigate('/settings/developers');
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
    if (isNonEmptyString(apiKeyData?.name)) {
      const newExpiresAt = computeNewExpirationDate(
        apiKeyData?.expiresAt,
        apiKeyData?.createdAt,
      );
      const apiKey = await createIntegration(apiKeyData?.name, newExpiresAt);
      await deleteIntegration(false);

      if (isNonEmptyString(apiKey?.token)) {
        setApiKeyToken(apiKey.token);
        navigate(`/settings/developers/api-keys/${apiKey.id}`);
      }
    }
  };

  return (
    <>
      {apiKeyData?.name && (
        <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
          <SettingsPageContainer>
            <SettingsHeaderContainer>
              <Breadcrumb
                links={[
                  { children: 'Developers', href: '/settings/developers' },
                  { children: `${apiKeyName} API Key` },
                ]}
              />
            </SettingsHeaderContainer>
            <Section>
              {apiKeyToken ? (
                <>
                  <H2Title
                    title="Api Key"
                    description="Copy this key as it will only be visible this one time"
                  />
                  <ApiKeyInput apiKey={apiKeyToken} />
                  <StyledInfo>
                    {formatExpiration(apiKeyData?.expiresAt || '', true, false)}
                  </StyledInfo>
                </>
              ) : (
                <>
                  <H2Title
                    title="Api Key"
                    description="Regenerate an Api key"
                  />
                  <StyledInputContainer>
                    <Button
                      title="Regenerate Key"
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
              <H2Title title="Name" description="Name of your API key" />
              <ApiKeyNameInput
                apiKeyName={apiKeyName}
                apiKeyId={apiKeyData?.id}
                disabled={loading}
                onNameUpdate={setApiKeyName}
              />
            </Section>
            <Section>
              <H2Title
                title="Expiration"
                description="When the key will be diasbled"
              />
              <TextInput
                placeholder="E.g. backoffice integration"
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
                title="Danger zone"
                description="Delete this integration"
              />
              <Button
                accent="danger"
                variant="secondary"
                title="Delete"
                Icon={IconTrash}
                onClick={() => setIsDeleteApiKeyModalOpen(true)}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
      <ConfirmationModal
        confirmationPlaceholder="yes"
        confirmationValue="yes"
        isOpen={isDeleteApiKeyModalOpen}
        setIsOpen={setIsDeleteApiKeyModalOpen}
        title="Delete Api key"
        subtitle={
          <>
            Please type "yes" to confirm you want to delete this API Key. Be
            aware that any script using this key will stop working.
          </>
        }
        onConfirmClick={deleteIntegration}
        deleteButtonText="Delete"
      />
      <ConfirmationModal
        confirmationPlaceholder="yes"
        confirmationValue="yes"
        isOpen={isRegenerateKeyModalOpen}
        setIsOpen={setIsRegenerateKeyModalOpen}
        title="Regenerate an Api key"
        subtitle={
          <>
            If you’ve lost this key, you can regenerate it, but be aware that
            any script using this key will need to be updated. Please type "yes"
            to confirm.
          </>
        }
        onConfirmClick={regenerateApiKey}
        deleteButtonText="Regenerate key"
      />
    </>
  );
};
