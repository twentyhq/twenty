import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  PAGE_RESUBSCRIBE_ROUTE_PATH,
  PAGES_HEALTH_GET_ROUTE_PATH,
} from 'src/constants/pages-health-route-paths.constant';
import {
  type GetPagesHealthResult,
  type PageHealth,
} from 'src/logic-functions/types/page-health.type';
import { type SettingsRouteResult } from 'src/logic-functions/types/settings-route-result.type';

const getListStyle = () =>
  ({
    display: 'flex',
    flexDirection: 'column',
    gap: themeCssVariables.spacing[3],
  }) as const;

const getRowStyle = () =>
  ({
    alignItems: 'center',
    display: 'flex',
    gap: themeCssVariables.spacing[3],
    justifyContent: 'space-between',
  }) as const;

const getNameStyle = () =>
  ({
    color: themeCssVariables.font.color.primary,
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.sm,
    fontWeight: themeCssVariables.font.weight.medium,
  }) as const;

const getDetailStyle = () =>
  ({
    color: themeCssVariables.font.color.tertiary,
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.sm,
  }) as const;

const needsResubscribe = (page: PageHealth) =>
  page.error === null &&
  (!page.isSubscribed || page.missingWebhookFields.length > 0);

export const PagesSettings = () => {
  const { t } = useTranslate();
  const [health, setHealth] = useState<GetPagesHealthResult | undefined>(
    undefined,
  );
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [resubscribingPageId, setResubscribingPageId] = useState<
    string | undefined
  >(undefined);

  const loadHealth = () =>
    new RestApiClient()
      .get<GetPagesHealthResult>(`/s${PAGES_HEALTH_GET_ROUTE_PATH}`)
      .then(setHealth)
      .catch(() => setLoadError(t('Could not load the Pages. Try again.')));

  // front components have no data hook, so the state loads once when the page opens
  useEffect(() => {
    loadHealth();
  }, []);

  const describeSubscription = (page: PageHealth) => {
    if (isNonEmptyString(page.error)) {
      return page.error;
    }

    if (!page.isSubscribed) {
      return t('Not receiving messages: Meta unsubscribed this Page.');
    }

    if (page.missingWebhookFields.length > 0) {
      return t('Receiving messages, but not: {fields}', {
        fields: page.missingWebhookFields.join(', '),
      });
    }

    return t('Receiving messages');
  };

  const handleResubscribe = async (pageId: string) => {
    setResubscribingPageId(pageId);

    try {
      const result = await new RestApiClient().post<SettingsRouteResult>(
        `/s${PAGE_RESUBSCRIBE_ROUTE_PATH}`,
        { pageId },
      );

      await enqueueSnackbar(
        result.success
          ? { message: t('Page resubscribed.'), variant: 'success' }
          : { message: result.error, variant: 'error' },
      );
      await loadHealth();
    } catch {
      await enqueueSnackbar({
        message: t('Could not resubscribe the Page. Try again.'),
        variant: 'error',
      });
    } finally {
      setResubscribingPageId(undefined);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Pages')}
        description={t(
          'Meta stops sending messages for a Page after an hour of failed deliveries. Resubscribe it here.',
        )}
      />
      {isNonEmptyString(loadError) ? (
        <Callout status="error" title={loadError} />
      ) : !isDefined(health) ? (
        <span style={getDetailStyle()}>{t('Loading…')}</span>
      ) : health.pages.length === 0 ? (
        <span style={getDetailStyle()}>
          {t('No Page is connected yet. Connect Messenger to add your Pages.')}
        </span>
      ) : (
        <div style={getListStyle()}>
          {health.pages.map((page) => (
            <div key={page.id} style={getRowStyle()}>
              <div>
                <div style={getNameStyle()}>{page.name}</div>
                <div style={getDetailStyle()}>{describeSubscription(page)}</div>
                <div style={getDetailStyle()}>
                  {page.isHistoryImported
                    ? t('Past conversations imported')
                    : t('Past conversations not imported yet')}
                </div>
              </div>
              {health.canEdit && needsResubscribe(page) && (
                <Button
                  type="button"
                  size="sm"
                  disabled={isDefined(resubscribingPageId)}
                  onClick={() => handleResubscribe(page.id)}
                >
                  {resubscribingPageId === page.id
                    ? t('Resubscribing…')
                    : t('Resubscribe')}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Section.Root>
  );
};
