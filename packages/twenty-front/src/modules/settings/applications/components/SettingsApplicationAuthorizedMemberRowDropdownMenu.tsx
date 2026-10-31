import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconUnlink } from 'twenty-ui/icon';
import {
  RevokeWorkspaceApplicationAuthorizationDocument,
  WorkspaceApplicationAuthorizationsDocument,
} from '~/generated-metadata/graphql';

type SettingsApplicationAuthorizedMemberRowDropdownMenuProps = {
  applicationAuthorizationId: string;
  applicationId: string;
  applicationName: string;
  memberName: string;
};

export const SettingsApplicationAuthorizedMemberRowDropdownMenu = ({
  applicationAuthorizationId,
  applicationId,
  applicationName,
  memberName,
}: SettingsApplicationAuthorizedMemberRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const [revokeWorkspaceApplicationAuthorization] = useMutation(
    RevokeWorkspaceApplicationAuthorizationDocument,
    {
      refetchQueries: [
        {
          query: WorkspaceApplicationAuthorizationsDocument,
          variables: { applicationId },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const revokeDialogId = `revoke-workspace-application-authorization-${applicationAuthorizationId}`;

  return (
    <>
      <DropdownRoot
        type="menu"
        dropdownId={`settings-application-authorized-member-row-${applicationAuthorizationId}`}
      >
        <Dropdown.Trigger
          render={
            <LightIconButton emphasis="subtle" aria-label={t`More options`}>
              <IconDotsVertical />
            </LightIconButton>
          }
        />
        <DropdownContent side="right" align="start">
          <Dropdown.Section>
            <Dropdown.ActionItem
              startIcon={<IconUnlink />}
              onClick={() => openDialog(revokeDialogId)}
            >{t`Revoke access`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      <ConfirmationDialog
        dialogId={revokeDialogId}
        title={t`Revoke ${memberName}'s access?`}
        subtitle={
          <Trans>
            {applicationName} will lose access to this workspace on behalf of{' '}
            {memberName} when its current access token expires.
          </Trans>
        }
        onConfirmClick={async () => {
          try {
            await revokeWorkspaceApplicationAuthorization({
              variables: { applicationAuthorizationId },
            });
          } catch (error) {
            enqueueToast(getToastOptionsFromError({ error }));
          }
        }}
        confirmButtonText={t`Revoke access`}
        shouldWaitForConfirmBeforeClosing
      />
    </>
  );
};
