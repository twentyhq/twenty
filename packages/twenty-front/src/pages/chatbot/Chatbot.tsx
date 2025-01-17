import { currentUserState } from '@/auth/states/currentUserState';
import { ChatbotPageContainer } from '@/chatbot/components/ui/ChatbotPageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useRecoilValue } from 'recoil';

export const Chatbot = () => {
  const currentUser = useRecoilValue(currentUserState);

  const chatbotBaseUrl = import.meta.env.REACT_APP_CHATBOT_BASE_URL;

  return (
    <ChatbotPageContainer>
      <PageContainer>
        <PageBody>
          {currentUser?.email && (
            <iframe
              title="Chatbot-iframe"
              src={`${chatbotBaseUrl}/signin?g=${currentUser?.email}`}
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
