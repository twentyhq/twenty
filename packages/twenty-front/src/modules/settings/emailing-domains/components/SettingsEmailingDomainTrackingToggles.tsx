import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconClick, IconEye } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import {
  SetEmailingDomainTrackingDocument,
  type SetEmailingDomainTrackingMutationVariables,
} from '~/generated-metadata/graphql';

type SettingsEmailingDomainTrackingTogglesProps = {
  emailingDomainId: string;
  isClickTrackingEnabled: boolean;
  isOpenTrackingEnabled: boolean;
};

export const SettingsEmailingDomainTrackingToggles = ({
  emailingDomainId,
  isClickTrackingEnabled,
  isOpenTrackingEnabled,
}: SettingsEmailingDomainTrackingTogglesProps) => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [setTracking, { loading }] = useMutation(
    SetEmailingDomainTrackingDocument,
  );

  const handleChange = async (
    change: Omit<SetEmailingDomainTrackingMutationVariables, 'id'>,
  ) => {
    try {
      await setTracking({ variables: { id: emailingDomainId, ...change } });
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
        onChange={(isEnabled) =>
          handleChange({ isClickTrackingEnabled: isEnabled })
        }
        divider
      />
      <SettingsOptionCardContentToggle
        Icon={IconEye}
        title={t`Track opens`}
        description={t`Add an invisible image so opens can be estimated. Mail clients that load images automatically can inflate this number.`}
        checked={isOpenTrackingEnabled}
        disabled={loading}
        onChange={(isEnabled) =>
          handleChange({ isOpenTrackingEnabled: isEnabled })
        }
      />
    </Card>
  );
};
