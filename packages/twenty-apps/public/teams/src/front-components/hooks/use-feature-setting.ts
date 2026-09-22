import { useEffect, useState } from 'react';
import { getApplicationVariable } from 'twenty-sdk/front-component';

import { loadFeatureSettingOrThrow } from 'src/front-components/utils/load-feature-setting-or-throw';
import { saveFeatureSettingOrThrow } from 'src/front-components/utils/save-feature-setting-or-throw';

const SETTINGS_REFRESH_INTERVAL_MS = 30_000;

type UseFeatureSettingParams = {
  variableKey: string;
  isAvailable: boolean;
};

export const useFeatureSetting = ({
  variableKey,
  isAvailable,
}: UseFeatureSettingParams) => {
  const [settingValue, setSettingValue] = useState(() =>
    getApplicationVariable(variableKey),
  );
  const [isLoading, setIsLoading] = useState(isAvailable);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);

  useEffect(() => {
    if (!isAvailable || isSaving) {
      return;
    }

    let isCancelled = false;
    let isRefreshing = false;

    const refreshSetting = async () => {
      if (isRefreshing) {
        return;
      }

      isRefreshing = true;

      try {
        const value = await loadFeatureSettingOrThrow(variableKey);

        if (!isCancelled) {
          setSettingValue(value);
          setHasLoadError(false);
        }
      } catch {
        if (!isCancelled) {
          setHasLoadError(true);
        }
      } finally {
        isRefreshing = false;

        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void refreshSetting();

    const interval = setInterval(() => {
      void refreshSetting();
    }, SETTINGS_REFRESH_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isAvailable, isSaving, variableKey]);

  const updateSetting = async (isEnabled: boolean) => {
    if (!isAvailable || isSaving || isLoading || hasLoadError) {
      return;
    }

    setIsSaving(true);
    setHasSaveError(false);

    try {
      await saveFeatureSettingOrThrow({ variableKey, isEnabled });
      setSettingValue(String(isEnabled));
    } catch {
      setHasSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settingValue,
    isLoading,
    hasLoadError,
    isSaving,
    hasSaveError,
    updateSetting,
  };
};
