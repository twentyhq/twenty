import { useLingui } from '@lingui/react/macro';

import { billingState } from '@/client-config/states/billingState';
import { isEmailingDomainInDemoModeState } from '@/client-config/states/isEmailingDomainInDemoModeState';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import {
  type UnsubscribeTopicsQuery,
  UnsubscribeTopicVisibility,
} from '~/generated-metadata/graphql';
import { Pill, Status } from 'twenty-ui/data-display';
import { IconArrowUp, IconLock } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UnsubscribeTopic = UnsubscribeTopicsQuery['unsubscribeTopics'][number];

export const SettingsWorkspaceUnsubscribeTopicSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { unsubscribeTopics } = useUnsubscribeTopics();
  const isEmailingDomainInDemoMode = useAtomStateValue(
    isEmailingDomainInDemoModeState,
  );
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  const title = t`Unsubscribe topics`;
  const description = t`Email categories recipients can opt out of`;
  const organizationPill = <Pill Icon={IconLock} label={t`Organization`} />;

  if (isEmailingDomainInDemoMode) {
    return (
      <Section>
        <H2Title
          title={title}
          description={description}
          adornment={organizationPill}
        />
        <Card rounded>
          <SettingsOptionCardContentButton
            Icon={IconLock}
            title={t`Upgrade to access`}
            description={t`Sending requires the AWS SES driver with an Enterprise licence.`}
            Button={
              <Button
                title={t`Upgrade`}
                variant="primary"
                accent="blue"
                size="small"
                Icon={IconArrowUp}
                onClick={() =>
                  navigateSettings(
                    isBillingEnabled
                      ? SettingsPath.Billing
                      : SettingsPath.AdminPanelEnterprise,
                  )
                }
              />
            }
          />
        </Card>
      </Section>
    );
  }

  return (
    <SettingsTableListSection<UnsubscribeTopic>
      title={title}
      description={description}
      headerAdornment={organizationPill}
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
