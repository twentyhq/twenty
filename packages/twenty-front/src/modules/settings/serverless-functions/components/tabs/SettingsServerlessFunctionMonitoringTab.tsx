import { AnalyticsActivityGraph } from '@/analytics/components/AnalyticsActivityGraph';
import { AnalyticsGraphEffect } from '@/analytics/components/AnalyticsGraphEffect';
import { AnalyticsGraphDataInstanceContext } from '@/analytics/states/contexts/AnalyticsGraphDataInstanceContext';
import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useNavigate } from 'react-router-dom';
import { Key } from 'ts-key-enum';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';

export const SettingsServerlessFunctionMonitoringTab = ({
  serverlessFunctionId,
}: {
  serverlessFunctionId: string;
}) => {
  const navigate = useNavigate();

  useHotkeyScopeOnMount(
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionSettingsTab,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      navigate(getSettingsPagePath(SettingsPath.ServerlessFunctions));
    },
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionSettingsTab,
  );

  return (
    <>
      <AnalyticsGraphDataInstanceContext.Provider
        value={{
          instanceId: `function-${serverlessFunctionId}-errorCount`,
        }}
      >
        <AnalyticsGraphEffect
          recordId={serverlessFunctionId}
          endpointName="getServerlessFunctionErrorCount"
        />
        <AnalyticsActivityGraph
          recordId={serverlessFunctionId}
          endpointName="getServerlessFunctionErrorCount"
        />
      </AnalyticsGraphDataInstanceContext.Provider>

      <AnalyticsGraphDataInstanceContext.Provider
        value={{ instanceId: `function-${serverlessFunctionId}-duration` }}
      >
        <AnalyticsGraphEffect
          recordId={serverlessFunctionId}
          endpointName="getServerlessFunctionDuration"
        />
        <AnalyticsActivityGraph
          recordId={serverlessFunctionId}
          endpointName="getServerlessFunctionDuration"
        />
      </AnalyticsGraphDataInstanceContext.Provider>

      <AnalyticsGraphDataInstanceContext.Provider
        value={{ instanceId: `function-${serverlessFunctionId}-successRate` }}
      >
        <AnalyticsGraphEffect
          recordId={serverlessFunctionId}
          endpointName="getServerlessFunctionSuccessRate"
        />
        <AnalyticsActivityGraph
          recordId={serverlessFunctionId}
          endpointName="getServerlessFunctionSuccessRate"
        />
      </AnalyticsGraphDataInstanceContext.Provider>
    </>
  );
};
