import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useActorFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useActorFieldDisplay';
import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';
import { isDefined } from 'twenty-shared/utils';

export const ActorFieldDisplay = () => {
  const { fieldValue, avatarUrl, name } = useActorFieldDisplay();

  const displayActorField = !useIsFieldEmpty();
  if (!isDefined(fieldValue)) {
    return null;
  }

  return displayActorField ? (
    <ActorDisplay
      name={name}
      source={fieldValue.source}
      avatarUrl={avatarUrl}
      workspaceMemberId={fieldValue.workspaceMemberId}
      context={fieldValue.context}
    />
  ) : null;
};
