import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export type LogConsoleMember = Partial<FieldActorValue> & {
  avatarUrl?: string | null;
  isSupportTeam?: boolean;
};
