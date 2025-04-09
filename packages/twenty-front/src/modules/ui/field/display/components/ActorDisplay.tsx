import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';

import { useMemo } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { AvatarChip } from 'twenty-ui/components';
import {
  IconApi,
  IconCalendar,
  IconCsv,
  IconGmail,
  IconGoogleCalendar,
  IconMail,
  IconMicrosoftCalendar,
  IconMicrosoftOutlook,
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
        return PROVIDORS_ICON_MAPPING.CALENDAR[context?.provider ?? 'default'];
      case 'SYSTEM':
        return IconRobot;
      case 'WORKFLOW':
        return IconSettingsAutomation;
      case 'WEBHOOK':
        return IconWebhook;
      default:
        return undefined;
    }
  }, [source, context?.provider]);

  const isIconInverted =
    source === 'API' || source === 'IMPORT' || source === 'SYSTEM';

  return (
    <AvatarChip
      placeholderColorSeed={workspaceMemberId ?? undefined}
      name={name ?? ''}
      avatarType={workspaceMemberId ? 'rounded' : 'squared'}
      LeftIcon={LeftIcon}
      avatarUrl={avatarUrl ?? undefined}
      isIconInverted={isIconInverted}
    />
  );
};
