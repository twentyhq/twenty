import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconClick } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/components/feedback';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { doNotTranslate } from 'twenty-shared/i18n';

type ClickTrackingSwitchProps = {
  divider?: boolean;
};

export const ClickTrackingSwitch = ({ divider }: ClickTrackingSwitchProps) => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace, { loading }] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error(doNotTranslate('User is not logged in'));
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
      {currentWorkspace ? (
        <SettingsOptionCardContentSwitch
          Icon={IconClick}
          title={t`Track link clicks`}
          description={t`Count clicks by routing campaign links through Twenty before the original page.`}
          divider={divider}
          checked={currentWorkspace.isCampaignClickTrackingEnabled}
          disabled={loading}
          onChange={handleChange}
        />
      ) : null}
    </>
  );
};
