import { Status } from 'twenty-ui/display';
import { type ApplicationRegistrationVariable } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const SettingsApplicationRegistrationConfigVariableStatus = ({
  variable,
}: {
  variable: ApplicationRegistrationVariable;
}) => {
  const { t } = useLingui();

  return variable.isFilled ? (
    <Status color="green" text={t`Configured`} />
  ) : variable.isRequired ? (
    <Status color="red" text={t`Required`} />
  ) : (
    <Status color="gray" text={t`Not set`} />
  );
};
