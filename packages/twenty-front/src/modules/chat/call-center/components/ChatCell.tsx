import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui/display';

// eslint-disable-next-line @nx/enforce-module-boundaries
import WhatsappIcon from '/images/integrations/whatsapp-logo.svg';
// import MessengerIcon from '/images/integrations/messenger-logo.svg';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { formatDate } from '@/chat/utils/formatDate';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindAllAgents } from '@/settings/service-center/agents/hooks/useFindAllAgents';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useContext } from 'react';

const StyledItemChat = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) => theme.spacing(3)};
  transition: background-color 0.2s;
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledUserName = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledLastMessagePreview = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.gray50};
  margin: 0;
`;

const StyledDateAndUnreadMessagesContainer = styled.div`
  color: ${({ theme }) => theme.color.gray50};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
`;

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledUnreadMessages = styled.div`
  background-color: #1961ed;
  color: ${({ theme }) => theme.font.color.inverted};
  width: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: 600;
`;

const StyledIntegrationCard = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ isSelected, theme }) =>
    isSelected
      ? theme.background.transparent.medium
      : theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: 3px ${({ theme }) => theme.spacing(1)};
  width: max-content;

  & img {
    height: 14px;
    padding-right: ${({ theme }) => theme.spacing(1)};
    width: 14px;
  }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDiv = styled.div`
  width: 100%;
`;

const StyledContainerPills = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ChatCell = ({ chat, isSelected, onSelect, platform }: any) => {
  const { whatsappIntegrations, currentMember /*, messengerIntegrations*/ } =
    useContext(CallCenterContext) as CallCenterContextType;

  const { agents = [] } = useFindAllAgents();
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  // const integration =
  //   platform === 'whatsapp'
  //     ? whatsappIntegrations.find((wi) => wi.id === chat.integrationId)
  //     : messengerIntegrations.find(
  //         (fi: MessengerIntegration) => fi.id === chat.integrationId,
  //       );

  const integration = whatsappIntegrations.find(
    (wi) => wi.id === chat.integrationId,
  );

  const userNameToDisplay =
    chat.lastMessage.from !== 'system' ? chat.client.name : 'Current User';

  const messageToDisplay = `${userNameToDisplay}: ${
    chat.lastMessage.message?.length > 20
      ? (chat.lastMessage.message.at(19) === ' '
          ? chat.lastMessage.message.slice(0, 19)
          : chat.lastMessage.message.slice(0, 20)) + '...'
      : chat.lastMessage.message
  }`;

  const agent = agents.find((agent: any) => agent.id === chat.agent);

  const isAdmin = agents.find(
    (agent: any) => agent.id === currentMember?.agentId,
  )?.isAdmin;

  const member = workspaceMembers.find(
    (wsMember: any) => wsMember.id === agent?.memberId,
  );

  return (
    <StyledItemChat onClick={onSelect} isSelected={isSelected}>
      <Avatar
        avatarUrl={chat.avatarUrl}
        placeholderColorSeed={chat.client.name}
        placeholder={chat.client.name}
        type={'rounded'}
        size="xl"
      />
      <StyledContentContainer>
        <StyledContainerPills>
          <StyledIntegrationCard isSelected={isSelected}>
            <img
              src={WhatsappIcon}
              // src={platform === 'whatsapp' ? WhatsappIcon : MessengerIcon}
              alt={'Whatsapp'}
              //alt={platform === 'whatsapp' ? 'Whatsapp' : 'Messenger'}
            />
            {integration?.name}
          </StyledIntegrationCard>
          {isAdmin && chat.agent !== 'empty' && (
            <StyledIntegrationCard isSelected={isSelected}>
              {member?.name.firstName} {member?.name.lastName}
            </StyledIntegrationCard>
          )}
        </StyledContainerPills>
        <StyledContainer>
          <StyledDiv>
            <StyledUserName>{chat.client.name}</StyledUserName>
            <StyledLastMessagePreview>
              {messageToDisplay}
            </StyledLastMessagePreview>
          </StyledDiv>
          <StyledDateAndUnreadMessagesContainer>
            {formatDate(chat.lastMessage.createdAt).time}
            {chat.unreadMessages > 0 && (
              <StyledUnreadMessages>{chat.unreadMessages}</StyledUnreadMessages>
            )}
          </StyledDateAndUnreadMessagesContainer>
        </StyledContainer>
      </StyledContentContainer>
    </StyledItemChat>
  );
};
