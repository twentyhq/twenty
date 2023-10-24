import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilState, useResetRecoilState } from 'recoil';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ApiKeyInput } from '@/settings/developers/components/ApiKeyInput';
import { generatedApiKeyState } from '@/settings/developers/states/generatedApiKeyState';
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
} from '~/generated/graphql';
import { beautifyDateDiff } from '~/utils/date-utils';

const StyledInfo = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsDevelopersApiKeyDetail = () => {
  const navigate = useNavigate();
  const { apiKeyId = '' } = useParams();
  const [generatedApiKey] = useRecoilState(generatedApiKeyState);
  const resetGeneratedApiKey = useResetRecoilState(generatedApiKeyState);
  const apiKeyQuery = useGetApiKeyQuery({
    variables: {
      apiKeyId,
    },
  });
  const [deleteApiKey] = useDeleteOneApiKeyMutation();
  const deleteIntegration = async () => {
    await deleteApiKey({ variables: { apiKeyId } });
    navigate('/settings/developers/api-keys');
  };
  const { expiresAt, name } = apiKeyQuery.data?.findManyApiKey[0] || {};
  const computeInfo = () => {
    if (!expiresAt) {
      return '';
    }
    return `This key will expire in ${beautifyDateDiff(expiresAt)}`;
  };
  useEffect(() => {
    if (apiKeyQuery.data) {
      return () => {
        resetGeneratedApiKey();
      };
    }
  }, [apiKeyQuery, resetGeneratedApiKey]);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'APIs', href: '/settings/developers/api-keys' },
              { children: name || '' },
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
              <ApiKeyInput apiKey={generatedApiKey || ''} />
            </>
          ) : (
            <>
              <H2Title title="Api Key" description="Regenerate an Api key" />
              <Button title="Regenerate Key" Icon={IconRepeat} />
            </>
          )}
          <StyledInfo>{computeInfo()}</StyledInfo>
        </Section>
        <Section>
          <H2Title title="Name" description="Name of your API key" />
          <TextInput
            placeholder="E.g. backoffice integration"
            value={name || ''}
            disabled={true}
            fullWidth
          />
        </Section>
        <Section>
          <H2Title title="Danger zone" description="Delete this integration" />
          <Button
            accent="danger"
            variant="secondary"
            title="Disable"
            Icon={IconTrash}
            onClick={deleteIntegration}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
