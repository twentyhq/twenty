import { themeCssVariables } from 'twenty-ui/theme';
import { Button } from 'twenty-ui/primitives/input';
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
        <Button
          size="sm"
          variant="outline"
          color="danger"
          onClick={onConfigure}
        >{t`Configure`}</Button>
      }
    >{t`Missing configuration: ${missingLabels}`}</InlineBanner>
  );
};
