import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledMessageContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsMessageChannelsContainer = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
  );
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const setSelectedMessageChannel = useSetRecoilState(
    settingsAccountsSelectedMessageChannelState,
  );

  const messageChannelObjectMetadataItem = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
  });

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
      isSyncEnabled: {
        eq: true,
      },
    },
    recordGqlFields: generateDepthOneRecordGqlFields(
      messageChannelObjectMetadataItem,
    ),
    onCompleted: (data) => {
      setSelectedMessageChannel(data[0]);
    },
    skip: !accounts.length,
  });

  const tabs = messageChannels.map((messageChannel) => ({
    id: messageChannel.id,
    title: messageChannel.handle,
  }));

  if (!messageChannels.length) {
    return <SettingsNewAccountSection />;
  }

  const handleTabChange = (tabId: string) => {
    const selectedMessageChannel = messageChannels.find(
      (channel) => channel.id === tabId,
    );
    if (isDefined(selectedMessageChannel)) {
      setSelectedMessageChannel(selectedMessageChannel);
    }
  };

  return (
    <>
      {tabs.length > 1 && (
        <StyledMessageContainer>
          <TabList
            tabs={tabs}
            componentInstanceId={
              SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID
            }
            onChangeTab={handleTabChange}
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
