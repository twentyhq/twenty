import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { useMemo } from 'react';
import {
  AvatarChip,
  AvatarChipVariant,
  IconApi,
  IconCalendar,
  IconCsv,
  IconGmail,
  IconRobot,
  IconSettingsAutomation,
} from 'twenty-ui';

type ActorDisplayProps = Partial<FieldActorValue> & {
  avatarUrl?: string | null;
};

export const ActorDisplay = ({
  name,
  source,
  workspaceMemberId,
  avatarUrl,
}: ActorDisplayProps) => {
  const LeftIcon = useMemo(() => {
    switch (source) {
      case 'API':
        return IconApi;
      case 'IMPORT':
        return IconCsv;
      case 'EMAIL':
        return IconGmail;
      case 'CALENDAR':
        return IconCalendar;
      case 'SYSTEM':
        return IconRobot;
      case 'WORKFLOW':
        return IconSettingsAutomation;
      default:
        return undefined;
    }
  }, [source]);

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
      variant={AvatarChipVariant.Transparent}
    />
  );
};
