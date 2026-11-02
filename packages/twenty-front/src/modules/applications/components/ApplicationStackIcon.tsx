import { AppChip } from '@/applications/components/AppChip';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { isDefined } from 'twenty-shared/utils';
import { StackIcon } from 'twenty-ui/components/data-display';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

type ApplicationStackIconProps = {
  Icon?: IconComponent;
  applicationId?: string | null;
  showFirstPartyApplication?: boolean;
};

export const ApplicationStackIcon = ({
  Icon,
  applicationId,
  showFirstPartyApplication = false,
}: ApplicationStackIconProps) => {
  const theme = useTheme();
  const isThirdPartyApplication = useIsThirdPartyApplication(applicationId);
  const shouldShowApplication =
    isDefined(applicationId) &&
    (showFirstPartyApplication || isThirdPartyApplication);

  if (!isDefined(Icon)) {
    return shouldShowApplication ? (
      <AppChip applicationId={applicationId} size="md" chipOnly />
    ) : null;
  }

  const icon = <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;

  if (!shouldShowApplication) {
    return icon;
  }

  return (
    <StackIcon
      icon={icon}
      stackedIcon={<AppChip applicationId={applicationId} size="xs" chipOnly />}
    />
  );
};
