import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconClick } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { SetEmailingDomainTrackingDocument } from '~/generated-metadata/graphql';

type SettingsEmailingDomainTrackingTogglesProps = {
  emailingDomainId: string;
  isClickTrackingEnabled: boolean;
};

export const SettingsEmailingDomainTrackingToggles = ({
  emailingDomainId,
  isClickTrackingEnabled,
}: SettingsEmailingDomainTrackingTogglesProps) => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [setTracking, { loading }] = useMutation(
    SetEmailingDomainTrackingDocument,
  );

  const handleChange = async (isEnabled: boolean) => {
    try {
      await setTracking({
        variables: { id: emailingDomainId, isClickTrackingEnabled: isEnabled },
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
