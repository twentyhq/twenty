import { AppChip } from '@/applications/components/AppChip';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { isDefined } from 'twenty-shared/utils';
import { StackIcon } from 'twenty-ui/components/data-display';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

type ApplicationStackIconProps = {
  Icon?: IconComponent;
  applicationId?: string | null;
};

export const ApplicationStackIcon = ({
  Icon,
  applicationId,
}: ApplicationStackIconProps) => {
  const theme = useTheme();
  const isThirdPartyApplication = useIsThirdPartyApplication(applicationId);

  if (!isDefined(Icon)) {
    return isThirdPartyApplication ? (
      <AppChip applicationId={applicationId} size="md" chipOnly />
    ) : null;
  }

  const icon = <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;

  if (!isThirdPartyApplication) {
    return icon;
  }

  return (
    <StackIcon
      icon={icon}
      stackedIcon={<AppChip applicationId={applicationId} size="xs" chipOnly />}
    />
  );
};
