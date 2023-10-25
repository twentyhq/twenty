import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilState, useResetRecoilState } from 'recoil';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { GET_API_KEYS } from '@/settings/developers/graphql/queries/getApiKeys';
import { generatedApiKeyState } from '@/settings/developers/states/generatedApiKeyState';
import { computeNewExpirationDate } from '@/settings/developers/utils.py/compute-new-expiration-date';
import { formatExpiration } from '@/settings/developers/utils.py/format-expiration';
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

const StyledInfo = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsDevelopersApiKeyDetail = () => {
  const navigate = useNavigate();
  const { apiKeyId = '' } = useParams();

  const [generatedApiKey, setGeneratedApiKey] =
    useRecoilState(generatedApiKeyState);
  const resetGeneratedApiKey = useResetRecoilState(generatedApiKeyState);

  const [deleteApiKey] = useDeleteOneApiKeyMutation();
  const [insertOneApiKey] = useInsertOneApiKeyMutation();
  const apiKeyData = useGetApiKeyQuery({
    variables: {
      apiKeyId,
    },
  }).data?.findManyApiKey[0];

  const deleteIntegration = async (redirect: boolean = true) => {
    await deleteApiKey({
      variables: { apiKeyId },
      refetchQueries: [getOperationName(GET_API_KEYS) ?? ''],
    });
    if (redirect) {
      navigate('/settings/developers/api-keys');
    }
  };

  const regenerateApiKey = async () => {
    if (apiKeyData?.name) {
      const newExpiresAt = computeNewExpirationDate(
        apiKeyData.expiresAt,
        apiKeyData.createdAt,
      );
      const apiKey = await insertOneApiKey({
        variables: {
          data: {
            name: apiKeyData.name,
            expiresAt: newExpiresAt,
          },
        },
        refetchQueries: [getOperationName(GET_API_KEYS) ?? ''],
      });
      await deleteIntegration(false);
      setGeneratedApiKey(apiKey.data?.createOneApiKey?.token);
      navigate(
        `/settings/developers/api-keys/${apiKey.data?.createOneApiKey?.id}`,
      );
    }
  };

  useEffect(() => {
    if (apiKeyData) {
      return () => {
        resetGeneratedApiKey();
      };
    }
  }, [apiKeyData, resetGeneratedApiKey]);

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
                </>
              ) : (
                <>
                  <H2Title
                    title="Api Key"
                    description="Regenerate an Api key"
                  />
                  <Button
                    title="Regenerate Key"
                    Icon={IconRepeat}
                    onClick={regenerateApiKey}
                  />
                </>
              )}
              <StyledInfo>
                {formatExpiration(apiKeyData?.expiresAt || '', true, false)}
              </StyledInfo>
            </Section>
            <Section>
              <H2Title title="Name" description="Name of your API key" />
              <TextInput
                placeholder="E.g. backoffice integration"
                value={apiKeyData.name}
                disabled={true}
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
