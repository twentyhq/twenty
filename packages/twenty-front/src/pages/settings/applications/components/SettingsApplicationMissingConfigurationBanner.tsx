import { themeCssVariables } from 'twenty-ui/theme';
import { t } from '@lingui/core/macro';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertCircle } from 'twenty-ui/icon';
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
      status="error"
      icon={
        <IconAlertCircle
          size={themeCssVariables.icon.size.md}
          aria-hidden="true"
        />
      }
      action={
        <InlineBanner.Action
          onClick={onConfigure}
        >{t`Configure`}</InlineBanner.Action>
      }
    >{t`Missing configuration: ${missingLabels}`}</InlineBanner>
  );
};
