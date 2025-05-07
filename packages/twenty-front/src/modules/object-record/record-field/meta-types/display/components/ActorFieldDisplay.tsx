import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useActorFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useActorFieldDisplay';
import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';

export const ActorFieldDisplay = () => {
  const { fieldValue } = useActorFieldDisplay();

  const name = fieldValue.name ? fieldValue.name.trim() : '';

  const displayActorField = !useIsFieldEmpty();

  return displayActorField ? (
    <ActorDisplay
      name={name}
      source={fieldValue.source}
      avatarUrl={fieldValue.workspaceMember?.avatarUrl}
      workspaceMemberId={fieldValue.workspaceMemberId}
      context={fieldValue.context}
    />
  ) : null;
};
