import { useLingui } from '@lingui/react/macro';

import { useMessageTopics } from '@/activities/emails/hooks/useMessageTopics';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsPath } from 'twenty-shared/types';
import {
  type MessageTopicsQuery,
  MessageTopicVisibility,
} from '~/generated-metadata/graphql';
import { Status } from 'twenty-ui-deprecated/display';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type MessageTopic = MessageTopicsQuery['messageTopics'][number];

export const SettingsWorkspaceUnsubscribeGroupSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { messageTopics } = useMessageTopics();

  return (
    <SettingsTableListSection<MessageTopic>
      title={t`Unsubscribe Groups`}
      description={t`Email categories recipients can opt out of.`}
      items={messageTopics}
      columns={[
        {
          label: t`Name`,
          Cell: ({ item }) => <>{item.name ?? t`Untitled group`}</>,
        },
        {
          label: t`Visibility`,
          Cell: ({ item }) =>
            item.visibility === MessageTopicVisibility.PUBLIC ? (
              <Status color="blue" text={t`Public`} />
            ) : (
              <Status color="gray" text={t`Private`} />
            ),
        },
      ]}
      gridAutoColumns="1fr 1fr"
      onRowClick={(topic) =>
        navigateSettings(SettingsPath.UnsubscribeGroupDetail, {
          messageTopicId: topic.id,
        })
      }
      footerButtonLabel={t`Add unsubscribe group`}
      onFooterButtonClick={() =>
        navigateSettings(SettingsPath.NewUnsubscribeGroup)
      }
    />
  );
};
