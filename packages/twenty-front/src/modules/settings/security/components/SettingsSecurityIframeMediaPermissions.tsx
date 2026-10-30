import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsSecurityIframeMediaPermissionForm } from '@/settings/security/components/SettingsSecurityIframeMediaPermissionForm';
import { SettingsSecurityIframeMediaPermissionRow } from '@/settings/security/components/SettingsSecurityIframeMediaPermissionRow';
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
  const [hasSavedChanges, setHasSavedChanges] = useState(false);
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
      setHasSavedChanges(true);
      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
      return false;
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Embedded website media access`}
        description={t`Choose which websites embedded in iframe widgets can request microphone or camera access. Members still need to enable access and approve the browser permission.`}
      />
      <StyledContent>
        <SettingsSecurityIframeMediaPermissionsProvider
          value={{ savePermission }}
        >
          {permissions.map((permission) => (
            <SettingsSecurityIframeMediaPermissionRow
              key={permission.origin}
              permission={permission}
              disabled={isSaving}
            />
          ))}
          <SettingsSecurityIframeMediaPermissionForm
            disabled={isSaving}
            permissions={permissions}
          />
        </SettingsSecurityIframeMediaPermissionsProvider>
        {hasSavedChanges && (
          <>
            <Text role="status">{t`Changes saved. Reload open Twenty tabs to apply the updated permissions. Reloading ends active calls and recordings.`}</Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              {t`Reload page`}
            </Button>
          </>
        )}
      </StyledContent>
    </Section.Root>
  );
};
