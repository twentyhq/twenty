import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { useGeneratedApiKeys } from '@/settings/developers/hooks/useGeneratedApiKeys';
import { generatedApiKeyFamilyState } from '@/settings/developers/states/generatedApiKeyFamilyState';
import { computeNewExpirationDate } from '@/settings/developers/utils/compute-new-expiration-date';
import { formatExpiration } from '@/settings/developers/utils/format-expiration';
import { IconRepeat, IconSettings, IconTrash } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import {
  useDeleteOneApiKeyMutation,
  useGetApiKeyQuery,
  useInsertOneApiKeyMutation,
} from '~/generated/graphql';

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
  const navigate = useNavigate();
  const { apiKeyId = '' } = useParams();
  const { triggerOptimisticEffects } = useOptimisticEffect('ApiKeyV2');

  const setGeneratedApi = useGeneratedApiKeys();
  const [generatedApiKey] = useRecoilState(
    generatedApiKeyFamilyState(apiKeyId),
  );

  const [deleteApiKey] = useDeleteOneApiKeyMutation();
  const [insertOneApiKey] = useInsertOneApiKeyMutation();
  const apiKeyData = useGetApiKeyQuery({
    variables: {
      apiKeyId,
    },
  }).data?.findManyApiKey[0];

  const deleteIntegration = async (redirect = true) => {
    await deleteApiKey({
      variables: { apiKeyId },
      update: (cache) =>
        cache.evict({
          id: cache.identify({ __typename: 'ApiKey', id: apiKeyId }),
        }),
    });
    if (redirect) {
      navigate('/settings/developers/api-keys');
    }
  };

  const createIntegration = async (
    name: string,
    newExpiresAt: string | null,
  ) => {
    return await insertOneApiKey({
      variables: {
        data: {
          name: name,
          expiresAt: newExpiresAt,
        },
      },
      update: (_cache, { data }) => {
        if (data?.createOneApiKey) {
          triggerOptimisticEffects('ApiKey', [data?.createOneApiKey]);
        }
      },
    });
  };

  const regenerateApiKey = async () => {
    if (apiKeyData?.name) {
      const newExpiresAt = computeNewExpirationDate(
        apiKeyData.expiresAt,
        apiKeyData.createdAt,
      );
      const apiKey = await createIntegration(apiKeyData.name, newExpiresAt);
      await deleteIntegration(false);
      if (apiKey.data?.createOneApiKey) {
        setGeneratedApi(
          apiKey.data.createOneApiKey.id,
          apiKey.data.createOneApiKey.token,
        );
        navigate(
          `/settings/developers/api-keys/${apiKey.data.createOneApiKey.id}`,
        );
      }
    }
  };

  useEffect(() => {
    if (apiKeyData) {
      return () => {
        setGeneratedApi(apiKeyId, null);
      };
    }
  });

  return (
    <>
      {apiKeyData?.name && (
        <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
          <SettingsPageContainer>
            <SettingsHeaderContainer>
              <Breadcrumb
                links={[
                  { children: 'APIs', href: '/settings/developers/api-keys' },
                  { children: apiKeyData.name },
                ]}
              />
            </SettingsHeaderContainer>
            <Section>
              {generatedApiKey ? (
                <>
                  <H2Title
                    title="Api Key"
                    description="Copy this key as it will only be visible this one time"
                  />
                  <ApiKeyInput apiKey={generatedApiKey} />
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
                      onClick={regenerateApiKey}
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
              <TextInput
                placeholder="E.g. backoffice integration"
                value={apiKeyData.name}
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
                title="Disable"
                Icon={IconTrash}
                onClick={() => deleteIntegration()}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      )}
    </>
  );
};
