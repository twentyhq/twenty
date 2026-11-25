import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { WHATSAPP_ACCOUNT_HEALTH_ROUTE_PATH } from 'src/constants/whatsapp-account-health-route-path.constant';
import { type WhatsAppAccountHealth } from 'src/logic-functions/types/whatsapp-account-health.type';

const QUALITY_COLORS: Record<string, string> = {
  GREEN: themeCssVariables.color.green,
  YELLOW: themeCssVariables.color.yellow,
  RED: themeCssVariables.color.red,
};

const textStyle = {
  color: themeCssVariables.font.color.primary,
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
} as const;

const secondaryTextStyle = { ...textStyle, color: themeCssVariables.font.color.tertiary } as const;

const accountStyle = {
  border: `1px solid ${themeCssVariables.border.color.light}`,
  borderRadius: themeCssVariables.border.radius.md,
  display: 'flex',
  flexDirection: 'column',
  gap: themeCssVariables.spacing[2],
  padding: themeCssVariables.spacing[3],
} as const;

const phoneNumberStyle = { ...textStyle, alignItems: 'center', display: 'flex', gap: themeCssVariables.spacing[2] } as const;

export const AccountHealthSettings = () => {
  const { t } = useTranslate();
  const [accounts, setAccounts] = useState<WhatsAppAccountHealth[] | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  // front components have no data hook, so the health loads once when the page opens
  useEffect(() => {
    new RestApiClient()
      .get<{ accounts: WhatsAppAccountHealth[] }>(`/s${WHATSAPP_ACCOUNT_HEALTH_ROUTE_PATH}`)
      .then((response) => setAccounts(response.accounts))
      .catch(() => setLoadError(t('Could not load the WhatsApp account health. Try again.')));
  }, []);

  return (
    <Section.Root>
      <Section.Header
        title={t('Account health')}
        description={t('Quality rating and messaging limit of each phone number, and the messages and cost of the last 30 days.')}
      />
      {isNonEmptyString(loadError) ? (
        <Callout status="error" title={loadError} />
      ) : accounts === undefined ? (
        <span style={textStyle}>{t('Loading account health…')}</span>
      ) : accounts.length === 0 ? (
        <Callout status="warning" title={t('No WhatsApp account is connected yet.')} />
      ) : (
        accounts.map((account) => (
          <div key={account.whatsAppBusinessAccountId} style={accountStyle}>
            <strong style={textStyle}>{account.name}</strong>
            <span style={secondaryTextStyle}>
              {'error' in account.last30Days
                ? t('Analytics unavailable: {error}', { error: account.last30Days.error })
                : t('Last 30 days: {sentCount} sent, {deliveredCount} delivered, {cost} {currency} spent', {
                    sentCount: account.last30Days.sentCount,
                    deliveredCount: account.last30Days.deliveredCount,
                    cost: account.last30Days.cost,
                    currency: account.last30Days.currency ?? '',
                  })}
            </span>
            {account.phoneNumbers.map((phoneNumber) => (
              <div key={phoneNumber.displayPhoneNumber} style={phoneNumberStyle}>
                <span
                  aria-label={t('Quality rating {qualityRating}', { qualityRating: phoneNumber.qualityRating })}
                  style={{
                    backgroundColor: QUALITY_COLORS[phoneNumber.qualityRating] ?? themeCssVariables.color.gray,
                    borderRadius: '50%',
                    display: 'inline-block',
                    height: '8px',
                    width: '8px',
                  }}
                />
                <span>{`${phoneNumber.displayPhoneNumber} · ${phoneNumber.verifiedName}`}</span>
                <span style={secondaryTextStyle}>
                  {[phoneNumber.messagingLimitTier, phoneNumber.status, phoneNumber.nameStatus]
                    .filter(isNonEmptyString)
                    .join(' · ')}
                </span>
              </div>
            ))}
          </div>
        ))
      )}
    </Section.Root>
  );
};
