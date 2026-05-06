import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { AvatarOrIcon, Chip } from 'twenty-ui/components';
import {
  IconApi,
  IconCalendar,
  IconGmail,
  IconGoogleCalendar,
  IconMail,
  IconMicrosoftCalendar,
  IconMicrosoftOutlook,
  IconPlug,
  IconRobot,
  IconSettingsAutomation,
  IconUpload,
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
    [ConnectedAccountProvider.OIDC]: IconMail,
    [ConnectedAccountProvider.SAML]: IconMail,
    // App-managed connections aren't email accounts; this case is unreachable
    // for the EMAIL source but the lookup type still requires every provider.
    [ConnectedAccountProvider.APP]: IconMail,
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
        return IconUpload;
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
  }, [source, context?.provider]);

  const isIconInverted =
    source === 'API' || source === 'IMPORT' || source === 'SYSTEM';

  return (
    <Chip
      label={name ?? ''}
      emptyLabel={t`Untitled`}
      leftComponent={
        <AvatarOrIcon
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
