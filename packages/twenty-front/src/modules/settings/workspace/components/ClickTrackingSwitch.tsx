import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconClick } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const ClickTrackingSwitch = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('User is not logged in');
    }

    const isClickTrackingEnabled = !currentWorkspace.isClickTrackingEnabled;

    try {
      setCurrentWorkspace({ ...currentWorkspace, isClickTrackingEnabled });

      await updateWorkspace({
        variables: { input: { isClickTrackingEnabled } },
      });
    } catch (err: any) {
      setCurrentWorkspace({
        ...currentWorkspace,
        isClickTrackingEnabled: !isClickTrackingEnabled,
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
            Icon={IconClick}
            title={t`Track link clicks`}
            description={t`Count clicks by routing campaign links through Twenty before the original page.`}
            checked={currentWorkspace.isClickTrackingEnabled}
            onChange={handleChange}
          />
        </Card>
      )}
    </>
  );
};
