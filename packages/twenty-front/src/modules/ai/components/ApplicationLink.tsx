import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconApps } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type ApplicationLinkProps = {
  applicationId: string;
  displayName: string;
};

export const ApplicationLink = ({
  applicationId,
  displayName,
}: ApplicationLinkProps) => {
  const theme = useTheme();
  const hasApplicationsPermission = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={
        hasApplicationsPermission
          ? getSettingsPath(SettingsPath.ApplicationDetail, { applicationId })
          : undefined
      }
      leftComponent={
        <IconApps size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    />
  );
};
