import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconLifebuoy } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const ToggleImpersonate = () => {
  const { addErrorToast } = useErrorToast();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }
      await updateWorkspace({
        variables: {
          input: {
            allowImpersonation: value,
          },
        },
      });
      setCurrentWorkspace({
        ...currentWorkspace,
        allowImpersonation: value,
      });
    } catch (err: any) {
      addErrorToast(CombinedGraphQLErrors.is(err) ? err : undefined);
    }
  };

  return (
    <Card rounded>
      <SettingsOptionCardContentToggle
        Icon={IconLifebuoy}
        title={t`Allow Support Team Access`}
        description={t`Grant access to your workspace so we can troubleshoot problems.`}
        checked={currentWorkspace?.allowImpersonation ?? false}
        onChange={handleChange}
        advancedMode
      />
    </Card>
  );
};
