import { useActorFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useActorFieldDisplay';
import { ActorDisplay } from '@/ui/field/display/components/ActorDisplay';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { isNonEmptyString } from '@sniptt/guards';

export const ActorFieldDisplay = () => {
  const { fieldValue } = useActorFieldDisplay();

  const name = !fieldValue.workspaceMemberId
    ? fieldValue.name
    : [
        fieldValue.workspaceMember?.name.firstName,
        fieldValue.workspaceMember?.name.lastName,
      ]
        .filter(isNonEmptyString)
        .join(' ');

  return (
    <ActorDisplay
      name={name}
      source={fieldValue.source}
      avatarUrl={
        fieldValue.workspaceMemberId
          ? fieldValue.workspaceMember?.avatarUrl
          : DEFAULT_WORKSPACE_LOGO
      }
      workspaceMemberId={fieldValue.workspaceMemberId}
    />
  );
};
