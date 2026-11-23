import { useMutation } from '@apollo/client/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AGENT_CHAT_INBOX_NOTIFICATION_LEVEL } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconAt, IconBell, IconBellOff, IconEye } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UPDATE_INBOX_NOTIFICATION_SETTINGS } from '@/web-push/graphql/mutations/updateInboxNotificationSettings';
import {
  type UpdateInboxNotificationSettingsInput,
  type UserWorkspace,
} from '~/generated-metadata/graphql';

type InboxNotificationSettings = Pick<
  UserWorkspace,
  'inboxNotificationLevel' | 'isInboxNotificationPreviewEnabled'
>;

const inboxNotificationLevelOptions = [
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    title: msg`All chats you follow`,
    description: msg`Every new message in a chat you take part in or follow`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBell} />,
  },
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.DIRECT_MENTIONS_AND_ASSIGNED,
    title: msg`Direct messages and mentions`,
    description: msg`Direct messages, mentions and chats assigned to you`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconAt} />,
  },
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.NONE,
    title: msg`Off`,
    description: msg`No notification for new messages`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBellOff} />,
  },
];

export const InboxNotificationPreferences = () => {
  const { t } = useLingui();
  const [currentUserWorkspace, setCurrentUserWorkspace] = useAtomState(
    currentUserWorkspaceState,
  );
  const [updateInboxNotificationSettings] = useMutation<
    { updateInboxNotificationSettings: InboxNotificationSettings },
    { input: UpdateInboxNotificationSettingsInput }
  >(UPDATE_INBOX_NOTIFICATION_SETTINGS);

  if (!isDefined(currentUserWorkspace)) {
    return null;
  }

  const inboxNotificationLevel =
    inboxNotificationLevelOptions.find(
      ({ value }) => value === currentUserWorkspace.inboxNotificationLevel,
    )?.value ?? AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED;
  const isInboxNotificationPreviewEnabled =
    currentUserWorkspace.isInboxNotificationPreviewEnabled ?? true;

  const saveInboxNotificationSettings = async (
    update: Partial<UpdateInboxNotificationSettingsInput>,
  ) => {
    const { data } = await updateInboxNotificationSettings({
      variables: {
        input: {
          inboxNotificationLevel,
          isInboxNotificationPreviewEnabled,
          ...update,
        },
      },
    });

    const savedSettings = data?.updateInboxNotificationSettings;

    if (!isDefined(savedSettings)) {
      return;
    }

    setCurrentUserWorkspace((previousUserWorkspace) => {
      if (!isDefined(previousUserWorkspace)) {
        return previousUserWorkspace;
      }

      return {
        ...previousUserWorkspace,
        inboxNotificationLevel: savedSettings.inboxNotificationLevel,
        isInboxNotificationPreviewEnabled:
          savedSettings.isInboxNotificationPreviewEnabled,
      };
    });
  };

  return (
    <>
      <SettingsRadioSettingsCard
        name="inbox-notification-level"
        onChange={(selectedInboxNotificationLevel) =>
          void saveInboxNotificationSettings({
            inboxNotificationLevel: selectedInboxNotificationLevel,
          })
        }
        options={inboxNotificationLevelOptions}
        value={inboxNotificationLevel}
      />
      <Card.Root fullWidth>
        <SettingsOptionCardContentSwitch
          Icon={IconEye}
          title={t`Show message preview`}
          description={t`Show the sender, the chat and the message text in notifications. Leave it off on shared screens and devices`}
          checked={isInboxNotificationPreviewEnabled}
          disabled={
            inboxNotificationLevel === AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.NONE
          }
          onChange={(isChecked) =>
            void saveInboxNotificationSettings({
              isInboxNotificationPreviewEnabled: isChecked,
            })
          }
        />
      </Card.Root>
    </>
  );
};
