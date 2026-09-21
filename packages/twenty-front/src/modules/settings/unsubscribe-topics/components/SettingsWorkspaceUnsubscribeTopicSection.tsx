import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsPath } from 'twenty-shared/types';
import {
  type UnsubscribeTopicsQuery,
  UnsubscribeTopicVisibility,
} from '~/generated-metadata/graphql';
import { Status } from 'twenty-ui/primitives/data-display';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTopicName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

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
          Cell: ({ item }) => (
            <StyledTopicName>{item.name ?? t`Untitled topic`}</StyledTopicName>
          ),
        },
        {
          label: t`Visibility`,
          align: 'right',
          Cell: ({ item }) =>
            item.visibility === UnsubscribeTopicVisibility.PUBLIC ? (
              <Status color="blue">{t`Public`}</Status>
            ) : (
              <Status color="gray">{t`Private`}</Status>
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
