import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconEye } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/components';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { doNotTranslate } from 'twenty-shared/i18n';

type OpenTrackingSwitchProps = {
  divider?: boolean;
};

export const OpenTrackingSwitch = ({ divider }: OpenTrackingSwitchProps) => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace, { loading }] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error(doNotTranslate('User is not logged in'));
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
        <SettingsOptionCardContentSwitch
          Icon={IconEye}
          title={t`Track opens`}
          description={t`Count opens with an invisible image. Mail apps can block or preload it.`}
          divider={divider}
          checked={currentWorkspace.isCampaignOpenTrackingEnabled}
          disabled={loading}
          onChange={handleChange}
        />
      ) : null}
    </>
  );
};
