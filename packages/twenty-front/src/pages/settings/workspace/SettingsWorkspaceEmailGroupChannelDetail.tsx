import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { useDeleteEmailGroupChannel } from '@/settings/accounts/hooks/useDeleteEmailGroupChannel';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title, IconCopy, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const DELETE_EMAIL_GROUP_MODAL_ID = 'delete-email-group-channel-modal';

const StyledForwardingRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledForwardingInputContainer = styled.div`
  flex: 1;
  margin-right: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceEmailGroupChannelDetail = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { messageChannelId } = useParams<{ messageChannelId: string }>();
  const { channels, loading } = useMyMessageChannels();
  const { copyToClipboard } = useCopyToClipboard();
  const { openModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { deleteEmailGroupChannel, loading: deleting } =
    useDeleteEmailGroupChannel();

  if (loading) {
    return null;
  }

  const channel = channels.find(
    (channel) =>
      channel.id === messageChannelId &&
      channel.type === MessageChannelType.EMAIL_GROUP,
  );

  if (!isDefined(channel)) {
    return <Navigate to={getSettingsPath(SettingsPath.Workspace)} replace />;
  }

  const sourceHandle = channel.connectedAccount?.handle ?? channel.handle;
  const forwardingAddress = channel.handle;

  const handleDelete = async () => {
    try {
      await deleteEmailGroupChannel(channel.id);
      navigate(-1);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to delete email group channel.`,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={sourceHandle}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`General`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: sourceHandle },
      ]}
      actionButton={
        <Button
          Icon={IconTrash}
          title={t`Delete`}
          variant="secondary"
          accent="danger"
          size="small"
          disabled={deleting}
          onClick={() => openModal(DELETE_EMAIL_GROUP_MODAL_ID)}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Source address`}
            description={t`The external address whose mail is forwarded into the workspace.`}
          />
          <SettingsTextInput
            instanceId="email-group-source"
            value={sourceHandle}
            disabled
            fullWidth
          />
        </Section>
        <Section>
          <H2Title
            title={t`Forwarding address`}
            description={t`Set up forwarding from the source address to this destination.`}
          />
          <StyledForwardingRow>
            <StyledForwardingInputContainer>
              <SettingsTextInput
                instanceId="email-group-forwarding"
                value={forwardingAddress}
                disabled
                fullWidth
              />
            </StyledForwardingInputContainer>
            <Button
              Icon={IconCopy}
              title={t`Copy`}
              onClick={() =>
                copyToClipboard(
                  forwardingAddress,
                  t`Forwarding address copied to clipboard`,
                )
              }
            />
          </StyledForwardingRow>
        </Section>
        <SettingsAccountsMessageChannelDetails messageChannel={channel} />
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_EMAIL_GROUP_MODAL_ID}
        title={t`Delete email group`}
        subtitle={t`Are you sure you want to delete ${sourceHandle}? Forwarded emails will no longer arrive in this workspace.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
        loading={deleting}
      />
    </SubMenuTopBarContainer>
  );
};
