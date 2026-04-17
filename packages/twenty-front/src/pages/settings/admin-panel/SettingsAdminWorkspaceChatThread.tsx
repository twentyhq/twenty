import { useParams } from 'react-router-dom';

import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { AI_ADMIN_PATH } from '@/settings/admin-panel/ai/constants/AiAdminPath';
import { SettingsAdminChatThreadMessageList } from '@/settings/admin-panel/components/SettingsAdminChatThreadMessageList';
import { GET_ADMIN_CHAT_THREAD_MESSAGES } from '@/settings/admin-panel/graphql/queries/getAdminChatThreadMessages';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type GetAdminChatThreadMessagesQuery } from '~/generated-metadata/graphql';

export const SettingsAdminWorkspaceChatThread = () => {
  const { workspaceId, threadId } = useParams<{
    workspaceId: string;
    threadId: string;
  }>();

  const { data, loading: isLoading } =
    useQuery<GetAdminChatThreadMessagesQuery>(GET_ADMIN_CHAT_THREAD_MESSAGES, {
      variables: { threadId },
      skip: !threadId,
    });

  const thread = data?.getAdminChatThreadMessages?.thread;
  const messages = data?.getAdminChatThreadMessages?.messages ?? [];

  const threadTitle = thread?.title || t`Untitled`;

  if (isLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - AI`,
          href: AI_ADMIN_PATH,
        },
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.AdminPanelWorkspaceDetail, {
            workspaceId: workspaceId ?? '',
          }),
        },
        {
          children: threadTitle,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={threadTitle} description={t`Chat conversation`} />
          <SettingsAdminChatThreadMessageList messages={messages} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
