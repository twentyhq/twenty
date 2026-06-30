import { useLazyQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { GET_UNSUBSCRIBE_PAGE_PREVIEW_URL } from '@/settings/unsubscribe-topics/graphql/queries/getUnsubscribePagePreviewUrl';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type UnsubscribeTopicsQuery,
  UnsubscribeTopicVisibility,
} from '~/generated-metadata/graphql';
import { Status } from 'twenty-ui/data-display';
import { IconExternalLink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UnsubscribeTopic = UnsubscribeTopicsQuery['unsubscribeTopics'][number];

export const SettingsWorkspaceUnsubscribeTopicSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { unsubscribeTopics } = useUnsubscribeTopics();
  const [getPreviewUrl] = useLazyQuery<{
    unsubscribePagePreviewUrl: string;
  }>(GET_UNSUBSCRIBE_PAGE_PREVIEW_URL);

  // Open the tab synchronously on click (so it isn't popup-blocked), then point
  // it at the freshly minted preview URL once the query resolves.
  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');

    void getPreviewUrl()
      .then(({ data }) => {
        const url = data?.unsubscribePagePreviewUrl;

        if (isDefined(previewWindow) && isDefined(url)) {
          previewWindow.location.href = url;
        } else {
          previewWindow?.close();
        }
      })
      .catch(() => previewWindow?.close());
  };

  return (
    <SettingsTableListSection<UnsubscribeTopic>
      title={t`Unsubscribe Topics`}
      description={t`Email categories recipients can opt out of.`}
      headerAdornment={
        <Button
          title={t`Preview`}
          variant="secondary"
          size="small"
          Icon={IconExternalLink}
          onClick={handlePreview}
        />
      }
      items={unsubscribeTopics}
      columns={[
        {
          label: t`Name`,
          Cell: ({ item }) => <>{item.name ?? t`Untitled topic`}</>,
        },
        {
          label: t`Visibility`,
          Cell: ({ item }) =>
            item.visibility === UnsubscribeTopicVisibility.PUBLIC ? (
              <Status color="blue" text={t`Public`} />
            ) : (
              <Status color="gray" text={t`Private`} />
            ),
        },
      ]}
      gridAutoColumns="1fr 1fr"
      onRowClick={(topic) =>
        navigateSettings(SettingsPath.UnsubscribeTopicDetail, {
          unsubscribeTopicId: topic.id,
        })
      }
      footerButtonLabel={t`Add unsubscribe topic`}
      onFooterButtonClick={() =>
        navigateSettings(SettingsPath.NewUnsubscribeTopic)
      }
    />
  );
};
