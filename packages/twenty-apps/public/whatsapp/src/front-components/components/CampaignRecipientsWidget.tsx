import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import {
  enqueueSnackbar,
  openCommandConfirmationModal,
  useColorScheme,
  useSelectedRecordIds,
  useTranslate,
} from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme';

import { WHATSAPP_CAMPAIGN_RECIPIENTS_ROUTE_PATH } from 'src/constants/whatsapp-campaign-recipients-route-path.constant';
import { WHATSAPP_CAMPAIGN_ROUTE_PATHS } from 'src/constants/whatsapp-campaign-route-paths.constant';
import { type SendTemplateToPeopleResult } from 'src/logic-functions/types/send-template-to-people-result.type';
import { type WhatsAppCampaignRecipient } from 'src/logic-functions/types/whatsapp-campaign-recipient.type';

type RecipientFilter = 'ALL' | 'FAILED' | 'NOT_REPLIED' | 'REPLIED';
type ResendAudience = 'FAILED' | 'NOT_REPLIED';

const matchesRecipientFilter = ({
  recipient,
  filter,
}: {
  recipient: WhatsAppCampaignRecipient;
  filter: RecipientFilter;
}) => {
  switch (filter) {
    case 'ALL':
      return true;
    case 'FAILED':
      return recipient.status === 'FAILED';
    case 'NOT_REPLIED':
      return !recipient.hasReplied;
    case 'REPLIED':
      return recipient.hasReplied;
  }
};

const getRecipientDetailText = ({ statusError, sentAt }: WhatsAppCampaignRecipient) => {
  if (isNonEmptyString(statusError)) {
    return statusError;
  }

  if (isNonEmptyString(sentAt)) {
    return new Date(sentAt).toLocaleString();
  }

  return '';
};

type CampaignRecipientsResponse =
  | { success: true; recipients: WhatsAppCampaignRecipient[] }
  | { success: false; error: string };

const STATUS_COLORS: Record<string, string> = {
  SENT: themeCssVariables.color.gray,
  DELIVERED: themeCssVariables.color.blue,
  READ: themeCssVariables.color.green,
  FAILED: themeCssVariables.color.red,
};

const textStyle = {
  color: themeCssVariables.font.color.primary,
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
} as const;

const secondaryTextStyle = { ...textStyle, color: themeCssVariables.font.color.tertiary } as const;

const listStyle = { display: 'flex', flexDirection: 'column', padding: themeCssVariables.spacing[3] } as const;

const toolbarStyle = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: themeCssVariables.spacing[2],
  paddingBottom: themeCssVariables.spacing[2],
} as const;

const selectStyle = {
  backgroundColor: themeCssVariables.background.transparent.lighter,
  border: `1px solid ${themeCssVariables.border.color.medium}`,
  borderRadius: themeCssVariables.border.radius.md,
  color: themeCssVariables.font.color.primary,
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
  height: '28px',
  padding: `0 ${themeCssVariables.spacing[2]}`,
} as const;

const rowStyle = {
  ...textStyle,
  alignItems: 'baseline',
  borderBottom: `1px solid ${themeCssVariables.border.color.light}`,
  display: 'grid',
  gap: themeCssVariables.spacing[2],
  gridTemplateColumns: 'minmax(0, 2fr) auto minmax(0, 1fr)',
  padding: `${themeCssVariables.spacing[2]} 0`,
} as const;

const CampaignRecipientsList = () => {
  const { t } = useTranslate();
  const [campaignId] = useSelectedRecordIds();
  const [recipients, setRecipients] = useState<WhatsAppCampaignRecipient[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<RecipientFilter>('ALL');
  const [isBusy, setIsBusy] = useState(false);

  const loadRecipients = useCallback(async () => {
    if (!isDefined(campaignId)) {
      return;
    }

    setIsBusy(true);
    setLoadError(undefined);

    try {
      const response = await new RestApiClient().get<CampaignRecipientsResponse>(
        `/s${WHATSAPP_CAMPAIGN_RECIPIENTS_ROUTE_PATH}`,
        { query: { campaignId } },
      );

      if (response.success) {
        setRecipients(response.recipients);
      } else {
        setLoadError(response.error);
      }
    } catch {
      setLoadError(t('Could not load the campaign recipients. Try again.'));
    } finally {
      setIsBusy(false);
    }
  }, [campaignId]);

  // front components have no data hook, so the recipients load when the tab opens and on refresh
  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  const handleResend = async (audience: ResendAudience) => {
    if (!isDefined(campaignId)) {
      return;
    }

    setIsBusy(true);

    const requestId = crypto.randomUUID();
    const postResend = (isDryRun: boolean) =>
      new RestApiClient().post<SendTemplateToPeopleResult>(`/s${WHATSAPP_CAMPAIGN_ROUTE_PATHS.resend}`, {
        requestId,
        campaignId,
        audience,
        isDryRun,
      });

    try {
      const dryRun = await postResend(true);

      if (!dryRun.success || dryRun.queuedCount === 0) {
        await enqueueSnackbar({
          message: dryRun.success ? t('Nobody left to send it to.') : dryRun.error,
          variant: 'warning',
        });

        return;
      }

      const choice = await openCommandConfirmationModal({
        title: t('Send the template again to {count} people?', { count: dryRun.queuedCount }),
        subtitle: t('This starts a new campaign with the same template and values.'),
        confirmButtonText: t('Send again'),
      });

      if (choice !== 'confirm') {
        return;
      }

      const result = await postResend(false);

      await enqueueSnackbar(
        result.success
          ? {
              message: t('{count} WhatsApp messages queued in a new campaign.', { count: result.queuedCount }),
              variant: 'success',
            }
          : { message: result.error, variant: 'error' },
      );
    } catch {
      await enqueueSnackbar({ message: t('Could not send the campaign again. Try again.'), variant: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  const statusLabels: Record<string, string> = {
    SENT: t('Sent'),
    DELIVERED: t('Delivered'),
    READ: t('Read'),
    FAILED: t('Failed'),
  };

  if (isNonEmptyString(loadError)) {
    return <Callout status="error" title={loadError} />;
  }

  if (!isDefined(recipients)) {
    return <span style={textStyle}>{t('Loading recipients…')}</span>;
  }

  if (recipients.length === 0) {
    return <span style={secondaryTextStyle}>{t('No message sent yet. Scheduled and queued messages appear here once sent.')}</span>;
  }

  const visibleRecipients = recipients.filter((recipient) => matchesRecipientFilter({ recipient, filter }));

  return (
    <div style={listStyle}>
      <div style={toolbarStyle}>
        <select
          style={selectStyle}
          value={filter}
          aria-label={t('Show')}
          onChange={(event) => {
            const nextFilter = (['ALL', 'FAILED', 'NOT_REPLIED', 'REPLIED'] as const).find(
              (option) => option === event.target.value,
            );

            setFilter(nextFilter ?? 'ALL');
          }}
        >
          <option value="ALL">{t('All recipients ({count})', { count: recipients.length })}</option>
          <option value="FAILED">{t('Failed')}</option>
          <option value="NOT_REPLIED">{t('Not replied')}</option>
          <option value="REPLIED">{t('Replied')}</option>
        </select>
        <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={loadRecipients}>
          {t('Refresh')}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={() => handleResend('FAILED')}>
          {t('Send again to failed')}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={() => handleResend('NOT_REPLIED')}>
          {t('Send again to non-repliers')}
        </Button>
      </div>
      {visibleRecipients.map((recipient) => (
        <div key={recipient.messageId} style={rowStyle}>
          <span>
            {recipient.recipientName ?? recipient.recipientHandle ?? t('Unknown recipient')}
            {isNonEmptyString(recipient.recipientName) && isNonEmptyString(recipient.recipientHandle) && (
              <span style={secondaryTextStyle}>{` · ${recipient.recipientHandle}`}</span>
            )}
          </span>
          <span
            style={{
              ...textStyle,
              color: STATUS_COLORS[recipient.status ?? ''] ?? themeCssVariables.font.color.tertiary,
              fontWeight: themeCssVariables.font.weight.medium,
            }}
          >
            {[statusLabels[recipient.status ?? ''] ?? t('Queued'), recipient.hasReplied ? t('Replied') : undefined]
              .filter(isNonEmptyString)
              .join(' · ')}
          </span>
          <span style={secondaryTextStyle}>{getRecipientDetailText(recipient)}</span>
        </div>
      ))}
    </div>
  );
};

export const CampaignRecipientsWidget = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider colorScheme={colorScheme}>
      <CampaignRecipientsList />
    </ThemeProvider>
  );
};
