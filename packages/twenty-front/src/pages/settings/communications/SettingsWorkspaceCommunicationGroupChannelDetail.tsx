import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';

import { useDeleteEmailGroupChannel } from '@/settings/accounts/hooks/useDeleteEmailGroupChannel';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';

import { getEmailChannelDomain } from '@/settings/accounts/utils/getEmailChannelDomain';
import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';

import { SettingsEmailingDomainVerifyButton } from '@/settings/emailing-domains/components/SettingsEmailingDomainVerifyButton';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  EmailingDomainStatus,
  GetEmailingDomainsDocument,
} from '~/generated-metadata/graphql';
import { Status } from 'twenty-ui/data-display';
import { IconCopy, IconTrash } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { type ThemeColor } from 'twenty-ui/theme';
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

const StyledSendingDomainAdornment = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const RECORD_STATUS_TO_COLOR: Partial<Record<string, ThemeColor>> = {
  success: 'green',
  pending: 'yellow',
  error: 'red',
};

export const SettingsWorkspaceCommunicationGroupChannelDetail = () => {
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

  const verificationRecords = (emailingDomain?.verificationRecords ?? []).map(
    (record) => ({
      ...record,
      status: record.status ?? undefined,
      statusColor: isDefined(record.status)
        ? (RECORD_STATUS_TO_COLOR[record.status] ?? 'gray')
        : undefined,
    }),
  );

  const isDomainVerified =
    verificationRecords.length > 0 &&
    verificationRecords.every((record) => record.status === 'success');

  const hasFailedRecord = verificationRecords.some(
    (record) => record.status === 'error',
  );

  const domainStatus = isDomainVerified
    ? EmailingDomainStatus.VERIFIED
    : hasFailedRecord
      ? EmailingDomainStatus.FAILED
      : EmailingDomainStatus.PENDING;

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

  return (
    <SettingsPageLayout
      title={sourceHandle}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
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
                <StyledSendingDomainAdornment>
                  <Status
                    color={getColorByEmailingDomainStatus(domainStatus)}
                    text={getTextByEmailingDomainStatus(domainStatus)}
                  />
                  {!isDomainVerified && (
                    <SettingsEmailingDomainVerifyButton
                      emailingDomainId={emailingDomain.id}
                    />
                  )}
                </StyledSendingDomainAdornment>
              }
            />
            {!isDomainVerified && (
              <SettingsDnsRecordsTable records={verificationRecords} />
            )}
          </Section>
        )}
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
