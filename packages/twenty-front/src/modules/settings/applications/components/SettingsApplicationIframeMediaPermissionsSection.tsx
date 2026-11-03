import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { buildApplicationIframeMediaPermissionSummary } from '@/marketplace/utils/buildApplicationIframeMediaPermissionSummary';
import { getPendingApplicationIframeMediaPermissions } from '@/settings/applications/utils/getPendingApplicationIframeMediaPermissions';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  ApproveApplicationIframeMediaPermissionsDocument,
  FindOneApplicationDocument,
} from '~/generated-metadata/graphql';

type SettingsApplicationIframeMediaPermissionsSectionProps = {
  applicationId: string;
  applicationName: string;
  requestedPermissions: readonly IframeMediaPermission[];
  grantedPermissions: readonly IframeMediaPermission[];
};

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationIframeMediaPermissionsSection = ({
  applicationId,
  applicationName,
  requestedPermissions,
  grantedPermissions,
}: SettingsApplicationIframeMediaPermissionsSectionProps) => {
  const { enqueueToast } = useToast();
  const apolloClient = useApolloClient();
  const [hasSavedChanges, setHasSavedChanges] = useState(false);
  const [approvePermissions, { loading: isSaving }] = useMutation(
    ApproveApplicationIframeMediaPermissionsDocument,
  );
  const pendingPermissions = getPendingApplicationIframeMediaPermissions({
    requestedPermissions,
    grantedPermissions,
  });

  const refreshApplication = async () => {
    try {
      await apolloClient.query({
        query: FindOneApplicationDocument,
        variables: { id: applicationId },
        fetchPolicy: 'network-only',
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const reviewPermissions = async () => {
    const approvedPermissions = pendingPermissions;

    if (isSaving || !isNonEmptyArray(approvedPermissions)) {
      return;
    }

    const permissionSummary =
      buildApplicationIframeMediaPermissionSummary(approvedPermissions);
    const confirmationMessage = [
      t`Approve media access for ${applicationName}?`,
      t`This grants access to this app for everyone in your workspace.`,
      ...permissionSummary.map(({ label }) => label),
    ].join('\n');

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      const { data } = await approvePermissions({
        variables: {
          applicationId,
          approvedIframeMediaPermissions: approvedPermissions,
        },
      });

      if (isDefined(data?.approveApplicationIframeMediaPermissions)) {
        setHasSavedChanges(true);
      }
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
      await refreshApplication();
    }
  };

  if (!isNonEmptyArray(pendingPermissions) && !hasSavedChanges) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Embedded website media access`}
        description={t`Review additional microphone or camera access requested by this app. Members still need to enable access and approve the browser permission.`}
      />
      <StyledContent>
        {isNonEmptyArray(pendingPermissions) && (
          <Button
            variant="outline"
            size="sm"
            onClick={reviewPermissions}
            disabled={isSaving}
          >{t`Review media access`}</Button>
        )}
        {hasSavedChanges && (
          <>
            <Text role="status">{t`Changes saved. Reload open Twenty tabs to apply the updated permissions. Reloading ends active calls and recordings.`}</Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >{t`Reload page`}</Button>
          </>
        )}
      </StyledContent>
    </Section.Root>
  );
};
