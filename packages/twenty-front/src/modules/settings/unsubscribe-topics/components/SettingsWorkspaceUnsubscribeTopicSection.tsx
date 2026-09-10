import { useLingui } from '@lingui/react/macro';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsPath } from 'twenty-shared/types';
import {
  type UnsubscribeTopicsQuery,
  UnsubscribeTopicVisibility,
} from '~/generated-metadata/graphql';
import { Status } from 'twenty-ui/data-display';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UnsubscribeTopic = UnsubscribeTopicsQuery['unsubscribeTopics'][number];

export const SettingsWorkspaceUnsubscribeTopicSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { unsubscribeTopics } = useUnsubscribeTopics();

  const title = t`Unsubscribe topics`;
  const description = t`Email categories recipients can opt out of`;

  return (
    <SettingsTableListSection<UnsubscribeTopic>
      title={title}
      description={description}
      items={unsubscribeTopics}
      columns={[
        {
          label: t`Topic`,
          Cell: ({ item }) => <>{item.name ?? t`Untitled topic`}</>,
        },
        {
          label: t`Visibility`,
          align: 'right',
          Cell: ({ item }) =>
            item.visibility === UnsubscribeTopicVisibility.PUBLIC ? (
              <Status color="blue" text={t`Public`} />
            ) : (
              <Status color="gray" text={t`Private`} />
            ),
        },
      ]}
      gridAutoColumns="1fr 1fr"
      showRowChevron
      onRowClick={(topic) =>
        navigateSettings(SettingsPath.UnsubscribeTopicDetail, {
          unsubscribeTopicId: topic.id,
        })
      }
      footerButtonLabel={t`Add topic`}
      onFooterButtonClick={() =>
        navigateSettings(SettingsPath.NewUnsubscribeTopic)
      }
    />
  );
};
