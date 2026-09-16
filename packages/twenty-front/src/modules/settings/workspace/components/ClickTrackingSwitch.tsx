import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconClick } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Card } from 'twenty-ui/primitives/surfaces';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const ClickTrackingSwitch = () => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace, { loading }] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('User is not logged in');
    }

    const isCampaignClickTrackingEnabled =
      !currentWorkspace.isCampaignClickTrackingEnabled;

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        isCampaignClickTrackingEnabled,
      });

      await updateWorkspace({
        variables: { input: { isCampaignClickTrackingEnabled } },
      });
    } catch (error) {
      setCurrentWorkspace({
        ...currentWorkspace,
        isCampaignClickTrackingEnabled: !isCampaignClickTrackingEnabled,
      });
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <>
      {currentWorkspace && (
        <Card rounded>
          <SettingsOptionCardContentSwitch
            Icon={IconClick}
            title={t`Track link clicks`}
            description={t`Count clicks by routing campaign links through Twenty before the original page.`}
            checked={currentWorkspace.isCampaignClickTrackingEnabled}
            disabled={loading}
            onChange={handleChange}
          />
        </Card>
      )}
    </>
  );
};
