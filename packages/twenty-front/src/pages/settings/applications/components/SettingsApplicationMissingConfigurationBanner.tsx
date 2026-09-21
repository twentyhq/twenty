import { t } from '@lingui/core/macro';
import { IconAlertCircle } from 'twenty-ui/icon';
import { InlineBanner } from 'twenty-ui/primitives/feedback';
import { type ApplicationVariable } from '~/generated-metadata/graphql';
import { getApplicationVariableDisplayLabel } from '~/pages/settings/applications/utils/getApplicationVariableDisplayLabel';

type SettingsApplicationMissingConfigurationBannerProps = {
  missingApplicationVariables: Pick<ApplicationVariable, 'key' | 'label'>[];
  onConfigure: () => void;
};

export const SettingsApplicationMissingConfigurationBanner = ({
  missingApplicationVariables,
  onConfigure,
}: SettingsApplicationMissingConfigurationBannerProps) => {
  const missingLabels = missingApplicationVariables
    .map(getApplicationVariableDisplayLabel)
    .join(', ');

  return (
    <InlineBanner
      color="danger"
      LeftIcon={IconAlertCircle}
      message={t`Missing configuration: ${missingLabels}`}
      button={{ title: t`Configure`, onClick: onConfigure }}
    />
  );
};
