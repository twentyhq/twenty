import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { useOpenLogConsoleTab } from '@/log-console/hooks/useOpenLogConsoleTab';

type SettingsApiWebhooksRedirectEffectProps = {
  view?: 'new' | 'detail';
};

export const SettingsApiWebhooksRedirectEffect = ({
  view,
}: SettingsApiWebhooksRedirectEffectProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiKeyId, webhookId } = useParams();
  const { openLogConsoleTab } = useOpenLogConsoleTab();

  useEffect(() => {
    if (location.hash === '#mcp') {
      navigate(getSettingsPath(SettingsPath.AI, undefined, undefined, 'mcp'), {
        replace: true,
      });
      return;
    }

    const isWebhook =
      isDefined(webhookId) ||
      location.hash === '#webhooks' ||
      location.pathname.includes('/webhooks/');
    const resourceId = isWebhook ? webhookId : apiKeyId;

    openLogConsoleTab(
      isWebhook ? 'webhooks' : 'apis',
      view === 'detail' && isDefined(resourceId)
        ? { type: 'detail', id: resourceId }
        : { type: view === 'new' ? 'new' : 'list' },
    );
    navigate(AppPath.Index, { replace: true });
  }, [
    apiKeyId,
    location.hash,
    location.pathname,
    navigate,
    openLogConsoleTab,
    view,
    webhookId,
  ]);

  return null;
};
