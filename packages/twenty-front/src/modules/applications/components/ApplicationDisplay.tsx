import { useApplicationAvatarColors } from '@/applications/hooks/useApplicationAvatarColors';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { buildApplicationLogoUrl } from '@/applications/utils/buildApplicationLogoUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

type ApplicationDisplayData = {
  id?: string | null;
  name?: string | null;
  universalIdentifier?: string | null;
  logo?: string | null;
};

type ApplicationDisplayProps = {
  application?: ApplicationDisplayData;
};

export const ApplicationDisplay = ({
  application,
}: ApplicationDisplayProps) => {
  const colors = useApplicationAvatarColors(application);
  const name = application?.name ?? '';
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const logoUrl = buildApplicationLogoUrl({
    applicationId: application?.id,
    logo: application?.logo,
    workspaceId: currentWorkspace?.id,
  });

  return (
    <>
      <Avatar
        type="app"
        size="md"
        avatarUrl={logoUrl}
        placeholder={name}
        placeholderColorSeed={application?.universalIdentifier ?? name}
        color={colors?.color}
        backgroundColor={colors?.backgroundColor}
        borderColor={colors?.borderColor}
      />
      <OverflowingTextWithTooltip text={name} />
    </>
  );
};
