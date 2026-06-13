import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { useMessageTopics } from '@/activities/emails/hooks/useMessageTopics';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { GET_UNSUBSCRIBE_PAGE_PREVIEW_URL } from '@/settings/unsubscribe-groups/graphql/queries/getUnsubscribePagePreviewUrl';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type MessageTopicsQuery,
  MessageTopicVisibility,
} from '~/generated-metadata/graphql';
import { IconExternalLink, Status } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type MessageTopic = MessageTopicsQuery['messageTopics'][number];

export const SettingsWorkspaceUnsubscribeGroupSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { messageTopics } = useMessageTopics();
  const { data: previewData } = useQuery<{
    unsubscribePagePreviewUrl: string;
  }>(GET_UNSUBSCRIBE_PAGE_PREVIEW_URL);

  const previewUrl = previewData?.unsubscribePagePreviewUrl;

  return (
    <SettingsTableListSection<MessageTopic>
      title={t`Unsubscribe Groups`}
      description={t`Email categories recipients can opt out of.`}
      headerAdornment={
        <Button
          title={t`Preview`}
          variant="secondary"
          size="small"
          Icon={IconExternalLink}
          disabled={!isDefined(previewUrl)}
          onClick={() => {
            if (isDefined(previewUrl)) {
              window.open(previewUrl, '_blank', 'noopener,noreferrer');
            }
          }}
        />
      }
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
