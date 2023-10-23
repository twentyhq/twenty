import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DateTime } from 'luxon';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings, IconTrash } from '@/ui/display/icon';
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

export const SettingsApiDetail = () => {
  const navigate = useNavigate();
  const { apiKeyId = '' } = useParams();
  const apiKeyQuery = useGetApiKeyQuery({
    variables: {
      apiKeyId,
    },
  });
  const [deleteApiKey] = useDeleteOneApiKeyMutation();
  const deleteIntegration = async () => {
    await deleteApiKey({ variables: { apiKeyId } });
    navigate('/settings/apis');
  };
  const apiKeyData = apiKeyQuery.data?.findManyApiKey[0];
  const { state } = useLocation();
  const computeLabel = () => {
    if (!apiKeyData?.expiresAt) return '';
    const dateDiff = DateTime.fromISO(apiKeyData.expiresAt).diff(
      DateTime.now(),
      ['years', 'days'],
    );
    let result = `This key will expire in `;
    if (dateDiff.years) result = result + `${dateDiff.years} year`;
    if (dateDiff.years > 1) result = result + 's';
    if (dateDiff.years && dateDiff.days) result = result + ' and ';
    if (dateDiff.days) result = result + `${Math.floor(dateDiff.days)} day`;
    if (dateDiff.days > 1) result = result + 's';
    return result;
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'APIs', href: '/settings/apis' },
              { children: apiKeyData?.name || '' },
            ]}
          />
        </SettingsHeaderContainer>
        <Section>
          <H2Title
            title="Api Key"
            description="Copie this key as it will only be visible this one time"
          />
          <TextInput
            placeholder="E.g. backoffice integration"
            info={computeLabel()}
            value={state}
            copyValue={state}
          />
        </Section>
        <Section>
          <H2Title title="Name" description="Name of your API key" />
          <TextInput
            placeholder="E.g. backoffice integration"
            value={apiKeyData?.name}
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
