import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ConnectedAccountProvider } from 'twenty-shared/types';
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
  type IconComponent,
} from 'twenty-ui/icon';

const PROVIDERS_ICON_MAPPING = {
  EMAIL: {
    [ConnectedAccountProvider.MICROSOFT]: IconMicrosoftOutlook,
    [ConnectedAccountProvider.GOOGLE]: IconGmail,
    [ConnectedAccountProvider.IMAP_SMTP_CALDAV]: IconMail,
    [ConnectedAccountProvider.OIDC]: IconMail,
    [ConnectedAccountProvider.SAML]: IconMail,
    [ConnectedAccountProvider.EMAIL_GROUP]: IconMail,
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

export const getActorSourceIcon = ({
  source,
  context,
}: Pick<Partial<FieldActorValue>, 'source' | 'context'>):
  | IconComponent
  | undefined => {
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
};
