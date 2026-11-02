import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { buildApplicationIframeMediaPermissionSummary } from '@/marketplace/utils/buildApplicationIframeMediaPermissionSummary';
import { getPendingApplicationIframeMediaPermissions } from '@/settings/applications/utils/getPendingApplicationIframeMediaPermissions';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId, useState } from 'react';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { ApproveApplicationIframeMediaPermissionsDocument } from '~/generated-metadata/graphql';

type SettingsApplicationIframeMediaPermissionsSectionProps = {
  applicationId: string;
  applicationName: string;
  requestedPermissions: readonly IframeMediaPermission[];
  grantedPermissions: readonly IframeMediaPermission[];
  onRefetchApplication: () => Promise<unknown>;
};

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledPermissionList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledPermission = styled.li`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationIframeMediaPermissionsSection = ({
  applicationId,
  applicationName,
  requestedPermissions,
  grantedPermissions,
  onRefetchApplication,
}: SettingsApplicationIframeMediaPermissionsSectionProps) => {
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const dialogId = useId();
  const [approvedPermissions, setApprovedPermissions] = useState<
    IframeMediaPermission[]
  >([]);
  const [hasSavedChanges, setHasSavedChanges] = useState(false);
  const [approvePermissions, { loading: isSaving }] = useMutation(
    ApproveApplicationIframeMediaPermissionsDocument,
  );
  const pendingPermissions = getPendingApplicationIframeMediaPermissions({
    requestedPermissions,
    grantedPermissions,
  });
  const permissionSummary =
    buildApplicationIframeMediaPermissionSummary(approvedPermissions);

  const reviewPermissions = () => {
    setApprovedPermissions(pendingPermissions);
    openDialog(dialogId);
  };

  const savePermissions = async () => {
    if (isSaving || !isNonEmptyArray(approvedPermissions)) {
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
      await onRefetchApplication().catch(() => undefined);
      setApprovedPermissions([]);
    }
  };

  if (
    !isNonEmptyArray(pendingPermissions) &&
    !isNonEmptyArray(approvedPermissions) &&
    !hasSavedChanges
  ) {
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
      <ConfirmationDialog
        shouldIsolateAppEvents
        dialogId={dialogId}
        title={t`Approve media access for ${applicationName}?`}
        subtitle={
          <StyledPermissionList>
            {permissionSummary.map(({ Icon, label }) => (
              <StyledPermission key={label}>
                <Icon size={16} aria-hidden />
                <Text>{label}</Text>
              </StyledPermission>
            ))}
          </StyledPermissionList>
        }
        confirmButtonText={t`Approve media access`}
        confirmButtonColor="accent"
        isConfirmButtonDisabled={!isNonEmptyArray(approvedPermissions)}
        onConfirmClick={savePermissions}
        onClose={() => setApprovedPermissions([])}
        loading={isSaving}
        shouldWaitForConfirmBeforeClosing
      />
    </Section.Root>
  );
};
