import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { AvatarChip, Chip } from 'twenty-ui/components';
import {
  IconApi,
  IconCalendar,
  IconCsv,
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

const PROVIDORS_ICON_MAPPING = {
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
  const LeftIcon = useMemo(() => {
    switch (source) {
      case 'API':
        return IconApi;
      case 'IMPORT':
        return IconCsv;
      case 'EMAIL':
        return PROVIDORS_ICON_MAPPING.EMAIL[context?.provider ?? 'default'];
      case 'CALENDAR':
        return (
          PROVIDORS_ICON_MAPPING.CALENDAR[
            context?.provider as keyof typeof PROVIDORS_ICON_MAPPING.CALENDAR
          ] ?? PROVIDORS_ICON_MAPPING.CALENDAR.default
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
  }, [source, context?.provider]);

  const isIconInverted =
    source === 'API' || source === 'IMPORT' || source === 'SYSTEM';

  return (
    <Chip
      label={name ?? ''}
      emptyLabel={t`Untitled`}
      leftComponent={
        <AvatarChip
          placeholderColorSeed={workspaceMemberId ?? undefined}
          avatarType={workspaceMemberId ? 'rounded' : 'squared'}
          placeholder={name}
          Icon={LeftIcon}
          avatarUrl={avatarUrl ?? undefined}
          isIconInverted={isIconInverted}
        />
      }
    />
  );
};
