import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconClick } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { SetEmailingDomainClickTrackingDocument } from '~/generated-metadata/graphql';

type SettingsEmailingDomainClickTrackingToggleProps = {
  emailingDomainId: string;
  isClickTrackingEnabled: boolean;
};

export const SettingsEmailingDomainClickTrackingToggle = ({
  emailingDomainId,
  isClickTrackingEnabled,
}: SettingsEmailingDomainClickTrackingToggleProps) => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [setClickTracking, { loading }] = useMutation(
    SetEmailingDomainClickTrackingDocument,
  );

  const handleChange = async (isEnabled: boolean) => {
    try {
      await setClickTracking({
        variables: { id: emailingDomainId, isEnabled },
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }
  };

  return (
    <Card rounded fullWidth>
      <SettingsOptionCardContentToggle
        Icon={IconClick}
        title={t`Track link clicks`}
        description={t`Rewrite links in campaign emails so clicks are counted. Requires one extra DNS record.`}
        checked={isClickTrackingEnabled}
        disabled={loading}
        onChange={handleChange}
      />
    </Card>
  );
};
