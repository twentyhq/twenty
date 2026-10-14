import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { useOpenLogConsoleTab } from '@/log-console/hooks/useOpenLogConsoleTab';
import { type LogConsoleResourceView } from '@/log-console/types/LogConsoleResourceView';

type LogConsoleSettingsRedirectEffectProps = {
  tabId?: 'apis' | 'webhooks';
  isNew?: boolean;
};

export const LogConsoleSettingsRedirectEffect = ({
  tabId = 'apis',
  isNew = false,
}: LogConsoleSettingsRedirectEffectProps) => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { apiKeyId, webhookId } = useParams();
  const { openLogConsoleTab } = useOpenLogConsoleTab();

  useEffect(() => {
    if (hash === '#mcp') {
      navigate(getSettingsPath(SettingsPath.AI, undefined, undefined, 'mcp'), {
        replace: true,
      });
      return;
    }

    const resourceId = apiKeyId ?? webhookId;
    const resourceView: LogConsoleResourceView = isDefined(resourceId)
      ? { type: 'detail', id: resourceId }
      : { type: isNew ? 'new' : 'list' };

    openLogConsoleTab({
      tabId: hash === '#webhooks' ? 'webhooks' : tabId,
      view: resourceView,
    });
    navigate(AppPath.Index, { replace: true });
  }, [apiKeyId, hash, isNew, navigate, openLogConsoleTab, tabId, webhookId]);

  return null;
};
