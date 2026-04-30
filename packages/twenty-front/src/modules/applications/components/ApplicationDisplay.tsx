import { useApplicationAvatarColors } from '@/applications/hooks/useApplicationAvatarColors';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui/display';

type ApplicationDisplayData = {
  id?: string | null;
  name?: string | null;
  universalIdentifier?: string | null;
  logoUrl?: string | null;
  applicationRegistration?: {
    logoUrl?: string | null;
  } | null;
};

type ApplicationDisplayProps = {
  application: ApplicationDisplayData;
};

export const ApplicationDisplay = ({
  application,
}: ApplicationDisplayProps) => {
  const colors = useApplicationAvatarColors(application);
  const name = application.name ?? '';
  const logoUrl =
    application.logoUrl ?? application.applicationRegistration?.logoUrl;

  return (
    <>
      <Avatar
        type="app"
        size="md"
        avatarUrl={logoUrl ?? undefined}
        placeholder={name}
        placeholderColorSeed={application.universalIdentifier ?? name}
        color={colors?.color}
        backgroundColor={colors?.backgroundColor}
        borderColor={colors?.borderColor}
      />
      <OverflowingTextWithTooltip text={name} />
    </>
  );
};
