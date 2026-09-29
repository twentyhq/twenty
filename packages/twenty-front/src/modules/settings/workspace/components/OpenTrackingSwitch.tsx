import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconEye } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/components';
import { Card } from 'twenty-ui/primitives/surfaces';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const OpenTrackingSwitch = () => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace, { loading }] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('User is not logged in');
    }

    const isCampaignOpenTrackingEnabled =
      !currentWorkspace.isCampaignOpenTrackingEnabled;

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        isCampaignOpenTrackingEnabled,
      });

      await updateWorkspace({
        variables: { input: { isCampaignOpenTrackingEnabled } },
      });
    } catch (error) {
      setCurrentWorkspace({
        ...currentWorkspace,
        isCampaignOpenTrackingEnabled: !isCampaignOpenTrackingEnabled,
      });
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <>
      {currentWorkspace ? (
        <Card.Root rounded>
          <SettingsOptionCardContentSwitch
            Icon={IconEye}
            title={t`Track opens`}
            description={t`Count opens with an invisible image. Mail apps can block or preload it.`}
            checked={currentWorkspace.isCampaignOpenTrackingEnabled}
            disabled={loading}
            onChange={handleChange}
          />
        </Card.Root>
      ) : null}
    </>
  );
};
