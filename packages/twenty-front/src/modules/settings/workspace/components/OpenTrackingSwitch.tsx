import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconEye } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const OpenTrackingSwitch = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('User is not logged in');
    }

    const isOpenTrackingEnabled = !currentWorkspace.isOpenTrackingEnabled;

    try {
      setCurrentWorkspace({ ...currentWorkspace, isOpenTrackingEnabled });

      await updateWorkspace({
        variables: { input: { isOpenTrackingEnabled } },
      });
    } catch (err: any) {
      setCurrentWorkspace({
        ...currentWorkspace,
        isOpenTrackingEnabled: !isOpenTrackingEnabled,
      });
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
        message: err?.message,
      });
    }
  };

  return (
    <>
      {currentWorkspace && (
        <Card rounded>
          <SettingsOptionCardContentSwitch
            Icon={IconEye}
            title={t`Track opens`}
            description={t`A 1x1 transparent image is added to each campaign email. When a recipient's mail client loads it, an open is counted. Open counts are an estimate: some mail clients load images automatically and some never load them.`}
            checked={currentWorkspace.isOpenTrackingEnabled}
            onChange={handleChange}
          />
        </Card>
      )}
    </>
  );
};
