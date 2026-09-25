import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconLifebuoy } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

import { useToast } from 'twenty-ui/components';

export const ImpersonationSwitch = () => {
  const { enqueueToast } = useToast();

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
      enqueueToast(getToastOptionsFromError({ error: err }));
    }
  };

  return (
    <Card.Root rounded>
      <SettingsOptionCardContentSwitch
        Icon={IconLifebuoy}
        title={t`Allow Support Team Access`}
        description={t`Grant access to your workspace so we can troubleshoot problems.`}
        checked={currentWorkspace?.allowImpersonation ?? false}
        onChange={handleChange}
        advancedMode
      />
    </Card.Root>
  );
};
