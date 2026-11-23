import { AppChip } from '@/applications/components/AppChip';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type ActorAppChipProps = {
  applicationId: string;
  name?: string | null;
};

export const ActorAppChip = ({ applicationId, name }: ActorAppChipProps) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const installedApplications = currentWorkspace?.installedApplications ?? [];

  // Reinstalling an app gives it a new id, so records it wrote before still
  // carry the old one; fall back to the installed app with the same name.
  const resolvedApplicationId = installedApplications.some(
    (application) => application.id === applicationId,
  )
    ? applicationId
    : (installedApplications.find((application) => application.name === name)
        ?.id ?? applicationId);

  return (
    <AppChip
      applicationId={resolvedApplicationId}
      fallbackApplicationData={{ name }}
      size="sm"
      chipOnly
    />
  );
};
