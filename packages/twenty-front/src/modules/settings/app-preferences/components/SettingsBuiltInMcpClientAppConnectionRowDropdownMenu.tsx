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
import { RevokeApplicationAuthorizationDocument } from '~/generated-metadata/graphql';

type SettingsBuiltInMcpClientAppConnectionRowDropdownMenuProps = {
  applicationAuthorizationId: string;
  appName: string;
  onDisconnected: () => Promise<unknown>;
};

export const SettingsBuiltInMcpClientAppConnectionRowDropdownMenu = ({
  applicationAuthorizationId,
  appName,
  onDisconnected,
}: SettingsBuiltInMcpClientAppConnectionRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const [revokeApplicationAuthorization] = useMutation(
    RevokeApplicationAuthorizationDocument,
  );

  const disconnectDialogId = `disconnect-application-authorization-${applicationAuthorizationId}`;

  return (
    <>
      <DropdownRoot
        type="menu"
        dropdownId={`settings-application-authorization-row-${applicationAuthorizationId}`}
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
              onClick={() => openDialog(disconnectDialogId)}
            >{t`Disconnect`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      <ConfirmationDialog
        dialogId={disconnectDialogId}
        title={t`Disconnect ${appName}?`}
        subtitle={
          <Trans>
            {appName} will lose access to this workspace. Requests already in
            progress can take a few minutes to stop.
          </Trans>
        }
        onConfirmClick={async () => {
          try {
            await revokeApplicationAuthorization({
              variables: { applicationAuthorizationId },
            });
            await onDisconnected();
          } catch (error) {
            enqueueToast(getToastOptionsFromError({ error }));
          }
        }}
        confirmButtonText={t`Disconnect`}
        shouldWaitForConfirmBeforeClosing
      />
    </>
  );
};
