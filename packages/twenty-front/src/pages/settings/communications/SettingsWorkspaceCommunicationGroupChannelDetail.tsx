import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { useDeleteEmailGroupChannel } from '@/settings/accounts/hooks/useDeleteEmailGroupChannel';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { useUpdateEmailGroupChannel } from '@/settings/accounts/hooks/useUpdateEmailGroupChannel';
import { getEmailChannelDomain } from '@/settings/accounts/utils/getEmailChannelDomain';
import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsEmailingDomainDnsRecords } from '@/settings/emailing-domains/components/SettingsEmailingDomainDnsRecords';
import { SettingsEmailingDomainVerifyButton } from '@/settings/emailing-domains/components/SettingsEmailingDomainVerifyButton';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconCopy, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { GetEmailingDomainsDocument } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { NotFound } from '~/pages/not-found/NotFound';

const DELETE_EMAIL_GROUP_MODAL_ID = 'delete-email-group-channel-modal';

const StyledInputRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledInputContainer = styled.div`
  flex: 1;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledSendingDomainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const SettingsWorkspaceCommunicationGroupChannelDetail = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { messageChannelId } = useParams<{ messageChannelId: string }>();
  const { channels, loading } = useMyMessageChannels();
  const { copyToClipboard } = useCopyToClipboard();
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();
  const { deleteEmailGroupChannel, loading: deleting } =
    useDeleteEmailGroupChannel();
  const { updateEmailGroupChannel, loading: updatingDisplayName } =
    useUpdateEmailGroupChannel();
  const { data: emailingDomainsData } = useQuery(GetEmailingDomainsDocument);

  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);

  if (loading) {
    return <SettingsSkeletonLoader />;
  }

  const channel = channels.find(
    (channel) =>
      channel.id === messageChannelId &&
      channel.type === MessageChannelType.EMAIL_GROUP,
  );

  if (!isDefined(channel) || !isDefined(channel.connectedAccount)) {
    return <NotFound />;
  }

  const sourceHandle = channel.connectedAccount.handle;
  const forwardingAddress = channel.handle;

  const channelDomain = getEmailChannelDomain(sourceHandle);
  const emailingDomain = emailingDomainsData?.getEmailingDomains?.find(
    (domain) => domain.domain.toLowerCase() === channelDomain,
  );

  const displayName = channel.displayName ?? '';

  const handleDisplayNameSave = async () => {
    if (!isDefined(displayNameDraft) || displayNameDraft === displayName) {
      setDisplayNameDraft(null);

      return;
    }

    const nextDisplayName = displayNameDraft.trim();

    try {
      await updateEmailGroupChannel(
        channel.id,
        isNonEmptyString(nextDisplayName) ? nextDisplayName : null,
      );
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to update sender name.`,
      });
    } finally {
      setDisplayNameDraft(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmailGroupChannel(channel.id);
      navigateSettings(SettingsPath.WorkspaceCommunications);
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to delete email channel.`,
      });
    }
  };

  return (
    <SettingsPageLayout
      pageTitle={displayNameDraft ?? displayName}
      title={
        <SettingsEditableTitle
          instanceId="email-group-display-name"
          value={displayNameDraft ?? displayName}
          placeholder={t`Sender name`}
          disabled={updatingDisplayName}
          onChange={setDisplayNameDraft}
          onEnter={handleDisplayNameSave}
          onTab={handleDisplayNameSave}
          onClickOutside={handleDisplayNameSave}
          onEscape={() => setDisplayNameDraft(null)}
        />
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: sourceHandle },
      ]}
      actionButton={
        <Button
          startIcon={<IconTrash />}
          size="sm"
          disabled={deleting}
          onClick={() => openDialog(DELETE_EMAIL_GROUP_MODAL_ID)}
          variant="outline"
          color="danger"
        >{t`Delete`}</Button>
      }
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`Shared email`}
            description={t`The shared email you want to use.`}
          />
          <SettingsTextInput
            instanceId="email-group-source"
            value={sourceHandle}
            disabled
            fullWidth
          />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Forwarding address`}
            description={t`Set up forwarding from the source address to this destination.`}
          />
          <StyledInputRow>
            <StyledInputContainer>
              <SettingsTextInput
                instanceId="email-group-forwarding"
                value={forwardingAddress}
                disabled
                fullWidth
              />
            </StyledInputContainer>
            <Button
              startIcon={<IconCopy />}
              onClick={() =>
                copyToClipboard(
                  forwardingAddress,
                  t`Forwarding address copied to clipboard`,
                )
              }
            >{t`Copy`}</Button>
          </StyledInputRow>
        </Section.Root>
        {isNonEmptyString(channel.displayName) && (
          <Section.Root>
            <Section.Header
              title={t`Sender name`}
              description={t`The name recipients see next to your address. It is set when the channel is created.`}
            />
            <SettingsTextInput
              instanceId="message-channel-sender-name"
              value={channel.displayName}
              disabled
              fullWidth
            />
          </Section.Root>
        )}
        {isDefined(emailingDomain) && (
          <Section.Root>
            <Section.Header
              title={t`Sending domain`}
              description={t`Add these records at your DNS provider. Twenty checks them automatically.`}
            />
            <StyledSendingDomainColumn>
              <StyledInputRow>
                <StyledInputContainer>
                  <SettingsTextInput
                    instanceId="email-group-sending-domain"
                    value={emailingDomain.domain}
                    disabled
                    fullWidth
                  />
                </StyledInputContainer>
                <SettingsEmailingDomainVerifyButton
                  emailingDomainId={emailingDomain.id}
                />
              </StyledInputRow>
              <SettingsEmailingDomainDnsRecords
                emailingDomain={emailingDomain}
              />
            </StyledSendingDomainColumn>
          </Section.Root>
        )}
        <SettingsAccountsMessageChannelDetails messageChannel={channel} />
      </SettingsPageContainer>
      <ConfirmationDialog
        dialogId={DELETE_EMAIL_GROUP_MODAL_ID}
        title={t`Delete email channel`}
        subtitle={t`Are you sure you want to delete ${sourceHandle}? Inbound mail forwarded to this address and outbound replies from it will stop working.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonColor="danger"
        loading={deleting}
      />
    </SettingsPageLayout>
  );
};
