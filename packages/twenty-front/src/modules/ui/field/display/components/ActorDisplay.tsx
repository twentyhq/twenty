import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { t } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { AvatarOrIcon, Chip, ChipVariant } from 'twenty-ui/components';
import {
  IconApi,
  IconArrowUp,
  IconCalendar,
  IconGmail,
  IconGoogleCalendar,
  IconMail,
  IconMicrosoftCalendar,
  IconMicrosoftOutlook,
  IconPlug,
  IconRobot,
  IconSettingsAutomation,
  IconWebhook,
} from 'twenty-ui/display';

type ActorDisplayProps = Partial<FieldActorValue> & {
  avatarUrl?: string | null;
};

const PROVIDERS_ICON_MAPPING = {
  EMAIL: {
    [ConnectedAccountProvider.MICROSOFT]: IconMicrosoftOutlook,
    [ConnectedAccountProvider.GOOGLE]: IconGmail,
    [ConnectedAccountProvider.IMAP_SMTP_CALDAV]: IconMail,
    default: IconMail,
  },
  CALENDAR: {
    [ConnectedAccountProvider.MICROSOFT]: IconMicrosoftCalendar,
    [ConnectedAccountProvider.GOOGLE]: IconGoogleCalendar,
    default: IconCalendar,
  },
};

export const ActorDisplay = ({
  name,
  source,
  workspaceMemberId,
  avatarUrl,
  context,
}: ActorDisplayProps) => {
  let LeftIcon;

  switch (source) {
    case 'API':
      LeftIcon = IconApi;
      break;
    case 'IMPORT':
      LeftIcon = IconArrowUp;
      break;
    case 'EMAIL':
      LeftIcon = PROVIDERS_ICON_MAPPING.EMAIL[context?.provider ?? 'default'];
      break;
    case 'CALENDAR':
      LeftIcon =
        PROVIDERS_ICON_MAPPING.CALENDAR[
          context?.provider as keyof typeof PROVIDERS_ICON_MAPPING.CALENDAR
        ] ?? PROVIDERS_ICON_MAPPING.CALENDAR.default;
      break;
    case 'SYSTEM':
      LeftIcon = IconRobot;
      break;
    case 'WORKFLOW':
      LeftIcon = IconSettingsAutomation;
      break;
    case 'WEBHOOK':
      LeftIcon = IconWebhook;
      break;
    case 'APPLICATION':
      LeftIcon = IconPlug;
      break;
    default:
      LeftIcon = undefined;
  }

  return (
    <Chip
      label={name ?? ''}
      clickable={false}
      emptyLabel={t`Untitled`}
      variant={ChipVariant.Transparent}
      leftComponent={
        <AvatarOrIcon
          placeholderColorSeed={workspaceMemberId ?? undefined}
          avatarType={workspaceMemberId ? 'rounded' : 'squared'}
          placeholder={name}
          Icon={LeftIcon}
          avatarUrl={avatarUrl ?? undefined}
        />
      }
    />
  );
};
