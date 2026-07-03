import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';

import { useDeleteEmailGroupChannel } from '@/settings/accounts/hooks/useDeleteEmailGroupChannel';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { UPDATE_MESSAGE_CHANNEL } from '@/settings/accounts/graphql/mutations/updateMessageChannel';
import { getEmailChannelDomain } from '@/settings/accounts/utils/getEmailChannelDomain';
import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsEmailingDomainVerifyButton } from '@/settings/emailing-domains/components/SettingsEmailingDomainVerifyButton';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { GetEmailingDomainsDocument } from '~/generated-metadata/graphql';
import { Status } from 'twenty-ui/data-display';
import { IconBriefcase, IconCopy, IconTrash, IconUsers } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { InlineBanner } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { NotFound } from '~/pages/not-found/NotFound';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_EMAIL_GROUP_MODAL_ID = 'delete-email-group-channel-modal';

const StyledForwardingRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledForwardingInputContainer = styled.div`
  flex: 1;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledDomainStatusRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledDomainName = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsWorkspaceEmailGroupChannelDetail = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { messageChannelId } = useParams<{ messageChannelId: string }>();
  const { channels, loading } = useMyMessageChannels();
  const { copyToClipboard } = useCopyToClipboard();
  const { openModal } = useModal();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { deleteEmailGroupChannel, loading: deleting } =
    useDeleteEmailGroupChannel();
  const { data: emailingDomainsData } = useQuery(GetEmailingDomainsDocument);
  const [updateMessageChannel] = useMutation(UPDATE_MESSAGE_CHANNEL);

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

  const handleDelete = async () => {
    try {
      await deleteEmailGroupChannel(channel.id);
      navigateSettings(SettingsPath.WorkspaceCommunications);
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to delete email channel.`,
      });
    }
  };

  const handleExcludeChange = (
    update:
      | { excludeGroupEmails: boolean }
      | { excludeNonProfessionalEmails: boolean },
  ) => {
    updateMessageChannel({
      variables: { input: { id: channel.id, update } },
    });
  };

  return (
    <SettingsPageLayout
      title={sourceHandle}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Emails`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
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
        <InlineBanner
          message={t`Need help to configure your shared mailbox?`}
          button={{
            title: t`Go to documentation`,
            onClick: () =>
              window.open(
                getDocumentationUrl({}),
                '_blank',
                'noopener,noreferrer',
              ),
          }}
        />
        <Section>
          <H2Title
            title={t`Shared email`}
            description={t`The shared email you want to use.`}
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
        {isDefined(emailingDomain) && (
          <Section>
            <H2Title
              title={t`Sending domain`}
              description={t`Outbound mail from this channel is sent through this domain. It must be verified before email can be delivered.`}
              adornment={
                <SettingsEmailingDomainVerifyButton
                  emailingDomainId={emailingDomain.id}
                />
              }
            />
            {isDefined(emailingDomain.verificationRecords) && (
              <SettingsDnsRecordsTable
                records={emailingDomain.verificationRecords}
              />
            )}
            <Card rounded>
              <StyledDomainStatusRow>
                <StyledDomainName>{emailingDomain.domain}</StyledDomainName>
                <Status
                  color={getColorByEmailingDomainStatus(emailingDomain.status)}
                  text={getTextByEmailingDomainStatus(emailingDomain.status)}
                />
              </StyledDomainStatusRow>
            </Card>
          </Section>
        )}
        <Section>
          <H2Title
            title={t`Advanced`}
            description={t`Configure what emails should get synced`}
          />
          <Card rounded>
            <SettingsOptionCardContentToggle
              Icon={IconUsers}
              title={t`Exclude group emails`}
              description={t`Don't import emails from team@ support@ noreply@...`}
              checked={channel.excludeGroupEmails}
              divider
              onChange={(checked) =>
                handleExcludeChange({ excludeGroupEmails: checked })
              }
            />
            <SettingsOptionCardContentToggle
              Icon={IconBriefcase}
              title={t`Exclude non-professional emails`}
              description={t`Don't create contacts from/to Gmail, Outlook emails`}
              checked={channel.excludeNonProfessionalEmails}
              onChange={(checked) =>
                handleExcludeChange({ excludeNonProfessionalEmails: checked })
              }
            />
          </Card>
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        modalInstanceId={DELETE_EMAIL_GROUP_MODAL_ID}
        title={t`Delete email channel`}
        subtitle={t`Are you sure you want to delete ${sourceHandle}? Inbound mail forwarded to this address and outbound replies from it will stop working.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
        confirmButtonAccent="danger"
        loading={deleting}
      />
    </SettingsPageLayout>
  );
};
