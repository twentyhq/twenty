import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsSecurityIframeMediaPermissionForm } from '@/settings/security/components/SettingsSecurityIframeMediaPermissionForm';
import { SettingsSecurityIframeMediaPermissionsTable } from '@/settings/security/components/SettingsSecurityIframeMediaPermissionsTable';
import { SettingsSecurityIframeMediaPermissionsProvider } from '@/settings/security/contexts/SettingsSecurityIframeMediaPermissionsContext';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { UpdateWorkspaceIframeMediaPermissionsDocument } from '~/generated-metadata/graphql';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsSecurityIframeMediaPermissions = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updatePermissions, { loading: isSaving }] = useMutation(
    UpdateWorkspaceIframeMediaPermissionsDocument,
  );
  const permissions = currentWorkspace?.iframeMediaPermissions ?? [];

  const savePermission = async (permission: IframeMediaPermission) => {
    if (isSaving) {
      return false;
    }

    try {
      const { data } = await updatePermissions({
        variables: { input: permission },
      });

      if (!isDefined(data?.updateWorkspaceIframeMediaPermissions)) {
        return false;
      }

      const { iframeMediaPermissions } =
        data.updateWorkspaceIframeMediaPermissions;

      setCurrentWorkspace((previousWorkspace) =>
        isDefined(previousWorkspace)
          ? { ...previousWorkspace, iframeMediaPermissions }
          : previousWorkspace,
      );
      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
      return false;
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Microphone and camera in iframes`}
        description={t`Websites whose iframe widgets can ask members for their microphone or camera. Changes apply after a page reload.`}
      />
      <StyledContent>
        <SettingsSecurityIframeMediaPermissionsProvider
          value={{ savePermission }}
        >
          <SettingsSecurityIframeMediaPermissionForm
            disabled={isSaving}
            permissions={permissions}
          />
          <SettingsSecurityIframeMediaPermissionsTable
            disabled={isSaving}
            permissions={permissions}
          />
        </SettingsSecurityIframeMediaPermissionsProvider>
      </StyledContent>
    </Section.Root>
  );
};
