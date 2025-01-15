import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { H2Title, Section } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useRecoilValue } from 'recoil';

export const Chatbot = () => {
  const currentUser = useRecoilValue(currentUserState);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const chatbotBaseUrl = import.meta.env.REACT_APP_CHATBOT_BASE_URL;

  return (
    <SubMenuTopBarContainer title="Chatbot" links={[]}>
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: '' }]} />
        <Section>
          <H2Title title={''} description={''} />
          {currentUser?.email && (
            <iframe
              title="Chatbot-iframe"
              src={`${chatbotBaseUrl}/signin?g=vitor.silveiravtss@gmail.com`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                overflow: 'auto',
              }}
            />
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
