import { useState } from 'react';
import { getApplicationVariable } from 'twenty-sdk/front-component';

import { saveFeatureSettingOrThrow } from 'src/front-components/utils/save-feature-setting-or-throw';

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
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);

  const updateSetting = async (isEnabled: boolean): Promise<boolean> => {
    if (!isAvailable || isSaving) {
      return false;
    }

    setIsSaving(true);
    setHasSaveError(false);

    try {
      await saveFeatureSettingOrThrow({ variableKey, isEnabled });
      setSettingValue(String(isEnabled));

      return true;
    } catch {
      setHasSaveError(true);

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { settingValue, isSaving, hasSaveError, updateSetting };
};
