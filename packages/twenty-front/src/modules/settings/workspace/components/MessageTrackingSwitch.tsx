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

export const MessageTrackingSwitch = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('User is not logged in');
    }

    const isMessageTrackingEnabled = !currentWorkspace.isMessageTrackingEnabled;

    try {
      setCurrentWorkspace({ ...currentWorkspace, isMessageTrackingEnabled });

      await updateWorkspace({
        variables: { input: { isMessageTrackingEnabled } },
      });
    } catch (err: any) {
      setCurrentWorkspace({
        ...currentWorkspace,
        isMessageTrackingEnabled: !isMessageTrackingEnabled,
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
            title={t`Track opens and clicks`}
            description={t`Rewrite campaign links and add an invisible image to count clicks and opens. Mail clients that load images automatically can inflate opens.`}
            checked={currentWorkspace.isMessageTrackingEnabled}
            onChange={handleChange}
          />
        </Card>
      )}
    </>
  );
};
