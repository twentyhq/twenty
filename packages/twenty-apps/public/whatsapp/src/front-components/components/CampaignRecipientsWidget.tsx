import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { useColorScheme, useSelectedRecordIds, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme';

import { WHATSAPP_CAMPAIGN_RECIPIENTS_ROUTE_PATH } from 'src/constants/whatsapp-campaign-recipients-route-path.constant';
import { type WhatsAppCampaignRecipient } from 'src/logic-functions/types/whatsapp-campaign-recipient.type';

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

  // front components have no data hook, so the recipients load once when the tab opens
  useEffect(() => {
    if (!isDefined(campaignId)) {
      return;
    }

    new RestApiClient()
      .get<CampaignRecipientsResponse>(`/s${WHATSAPP_CAMPAIGN_RECIPIENTS_ROUTE_PATH}`, { query: { campaignId } })
      .then((response) =>
        response.success ? setRecipients(response.recipients) : setLoadError(response.error),
      )
      .catch(() => setLoadError(t('Could not load the campaign recipients. Try again.')));
  }, [campaignId]);

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

  return (
    <div style={listStyle}>
      {recipients.map((recipient) => (
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
          <span style={secondaryTextStyle}>
            {isNonEmptyString(recipient.statusError)
              ? recipient.statusError
              : isNonEmptyString(recipient.sentAt)
                ? new Date(recipient.sentAt).toLocaleString()
                : ''}
          </span>
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
