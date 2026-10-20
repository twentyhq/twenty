import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconLifebuoy } from 'twenty-ui/icon';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

import { useToast } from 'twenty-ui/components/feedback';
import { doNotTranslate } from 'twenty-shared/i18n';

type ImpersonationSwitchProps = {
  divider?: boolean;
};

export const ImpersonationSwitch = ({ divider }: ImpersonationSwitchProps) => {
  const { enqueueToast } = useToast();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error(doNotTranslate('User is not logged in'));
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
    <SettingsOptionCardContentSwitch
      Icon={IconLifebuoy}
      title={t`Allow Support Team Access`}
      description={t`Grant access to your workspace so we can troubleshoot problems.`}
      checked={currentWorkspace?.allowImpersonation ?? false}
      onChange={handleChange}
      divider={divider}
    />
  );
};
