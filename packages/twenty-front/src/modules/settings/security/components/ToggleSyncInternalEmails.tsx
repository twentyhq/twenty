import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { IconMail } from 'twenty-ui/display';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const ToggleSyncInternalEmails = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async (value: boolean) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousValue = currentWorkspace.isInternalMessagesImportEnabled;

    setCurrentWorkspace({
      ...currentWorkspace,
      isInternalMessagesImportEnabled: value,
    });

    try {
      await updateWorkspace({
        variables: {
          input: {
            isInternalMessagesImportEnabled: value,
          },
        },
      });
    } catch (err: unknown) {
      setCurrentWorkspace({
        ...currentWorkspace,
        isInternalMessagesImportEnabled: previousValue,
      });
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
      });
    }
  };

  return (
    <SettingsOptionCardContentToggle
      Icon={IconMail}
      title={t`Sync Internal Emails`}
      description={t`Include emails where all participants share the same domain.`}
      checked={currentWorkspace?.isInternalMessagesImportEnabled ?? false}
      onChange={handleChange}
      advancedMode
    />
  );
};
