import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ChatbotPageContainer } from '@/chatbot/components/ui/ChatbotPageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useRecoilValue } from 'recoil';
import { IconRobot } from 'twenty-ui/display';
import { REACT_APP_CHATBOT_BASE_URL } from '~/config';

export const Chatbot = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  if (!REACT_APP_CHATBOT_BASE_URL)
    throw new Error('App is missing Chatbot environment configuration.');

  return (
    <ChatbotPageContainer>
      <PageContainer>
        <PageHeader title="Bot" Icon={IconRobot} />
        <PageBody>
          {currentWorkspace?.creatorEmail && (
            <iframe
              title="Chatbot-iframe"
              src={`${REACT_APP_CHATBOT_BASE_URL}/signin?g=${currentWorkspace?.creatorEmail}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                overflow: 'auto',
              }}
            />
          )}
        </PageBody>
      </PageContainer>
    </ChatbotPageContainer>
  );
};
