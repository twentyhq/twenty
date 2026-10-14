import { useIsFieldEmpty } from '@/object-record/record-field/ui/hooks/useIsFieldEmpty';
import { useActorFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useActorFieldDisplay';
import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';
import { isDefined } from 'twenty-shared/utils';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type ActorFieldDisplayProps = FieldDisplayTooltipProps;

export const ActorFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: ActorFieldDisplayProps) => {
  const actorFieldDisplay = useActorFieldDisplay();

  const displayActorField = !useIsFieldEmpty();
  if (!isDefined(actorFieldDisplay)) {
    return null;
  }

  const { fieldValue, name, avatarUrl } = actorFieldDisplay;

  return displayActorField ? (
    <ActorDisplay
      name={name}
      source={fieldValue.source}
      avatarUrl={avatarUrl}
      workspaceMemberId={fieldValue.workspaceMemberId}
      context={fieldValue.context}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  ) : null;
};
