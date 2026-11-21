import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { fetchLineQuota } from 'src/front-components/utils/fetch-line-quota.util';
import { type LineQuota } from 'src/logic-functions/types/line-quota.type';

const getColumnStyle = () =>
  ({
    display: 'flex',
    flexDirection: 'column',
    gap: themeCssVariables.spacing[3],
  }) as const;

const getDetailStyle = () =>
  ({
    color: themeCssVariables.font.color.tertiary,
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.sm,
  }) as const;

const getUsageStyle = () =>
  ({
    color: themeCssVariables.font.color.primary,
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.md,
    fontWeight: themeCssVariables.font.weight.medium,
  }) as const;

export const QuotaSettings = () => {
  const { t } = useTranslate();
  const [quota, setQuota] = useState<LineQuota | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  // front components have no data hook, so the count loads once when the page opens
  useEffect(() => {
    fetchLineQuota()
      .then(setQuota)
      .catch(() =>
        setLoadError(t('Could not load the message count. Try again.')),
      );
  }, []);

  const renderContent = () => {
    if (isNonEmptyString(loadError)) {
      return <Callout status="error" title={loadError} />;
    }

    if (!isDefined(quota)) {
      return <span style={getDetailStyle()}>{t('Loading…')}</span>;
    }

    if (quota.status === 'notConnected') {
      return (
        <span style={getDetailStyle()}>
          {t('Connect LINE to see the monthly message count.')}
        </span>
      );
    }

    if (!isDefined(quota.limit)) {
      return (
        <span style={getUsageStyle()}>
          {t('{used} messages sent this month. No monthly limit is set.', {
            used: quota.used,
          })}
        </span>
      );
    }

    return (
      <div style={getColumnStyle()}>
        <span style={getUsageStyle()}>
          {t('{used} of {limit} messages sent this month', {
            used: quota.used,
            limit: quota.limit,
          })}
        </span>
        {quota.used >= quota.limit && (
          <Callout
            status="warning"
            title={t('The monthly limit is reached')}
            description={t(
              'LINE refuses replies from Twenty until the limit resets next month or the plan is upgraded in LINE Official Account Manager.',
            )}
          />
        )}
      </div>
    );
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Monthly messages')}
        description={t(
          'Replies from Twenty are push messages and count against the monthly limit of {accountName}, as do messages sent from LINE Official Account Manager. LINE gives an approximate count.',
          {
            accountName:
              quota?.status === 'connected'
                ? quota.accountName
                : t('the Official Account'),
          },
        )}
      />
      {renderContent()}
    </Section.Root>
  );
};
