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
  type IconComponent,
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

const getLeftIcon = ({
  source,
  context,
}: Pick<ActorDisplayProps, 'source' | 'context'>):
  | IconComponent
  | undefined => {
  switch (source) {
    case 'API':
      return IconApi;
    case 'IMPORT':
      return IconArrowUp;
    case 'EMAIL':
      return PROVIDERS_ICON_MAPPING.EMAIL[context?.provider ?? 'default'];
    case 'CALENDAR':
      return (
        PROVIDERS_ICON_MAPPING.CALENDAR[
          context?.provider as keyof typeof PROVIDERS_ICON_MAPPING.CALENDAR
        ] ?? PROVIDERS_ICON_MAPPING.CALENDAR.default
      );
    case 'SYSTEM':
      return IconRobot;
    case 'WORKFLOW':
      return IconSettingsAutomation;
    case 'WEBHOOK':
      return IconWebhook;
    case 'APPLICATION':
      return IconPlug;
    default:
      return undefined;
  }
};

export const ActorDisplay = ({
  name,
  source,
  workspaceMemberId,
  avatarUrl,
  context,
}: ActorDisplayProps) => {
  const LeftIcon = getLeftIcon({ source, context });

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
