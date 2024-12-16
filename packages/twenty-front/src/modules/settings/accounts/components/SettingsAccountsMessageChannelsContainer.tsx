import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import React from 'react';

const StyledMessageContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsMessageChannelsContainer = () => {
  const { activeTabId } = useTabList(
    SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
  );
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: accounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  const { records: messageChannels } = useFindManyRecords<
    MessageChannel & {
      connectedAccount: ConnectedAccount;
    }
  >({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    filter: {
      connectedAccountId: {
        in: accounts.map((account) => account.id),
      },
    },
    skip: !accounts.length,
  });

  const tabs = [
    ...messageChannels.map((messageChannel) => ({
      id: messageChannel.id,
      title: messageChannel.handle,
    })),
  ];

  if (!messageChannels.length) {
    return <SettingsNewAccountSection />;
  }

  return (
    <>
      {tabs.length > 1 && (
        <StyledMessageContainer>
          <TabList
            tabListInstanceId={
              SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID
            }
            tabs={tabs}
          />
        </StyledMessageContainer>
      )}
      {messageChannels.map((messageChannel) => (
        <React.Fragment key={messageChannel.id}>
          {(messageChannels.length === 1 ||
            messageChannel.id === activeTabId) && (
            <SettingsAccountsMessageChannelDetails
              messageChannel={messageChannel}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};
