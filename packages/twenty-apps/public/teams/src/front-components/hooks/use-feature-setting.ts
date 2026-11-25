import { useState } from 'react';
import { getApplicationVariable } from 'twenty-sdk/front-component';

import { saveFeatureSettingOrThrow } from 'src/front-components/utils/save-feature-setting-or-throw';

type UseFeatureSettingParams = {
  variableKey: string;
};

export const useFeatureSetting = ({
  variableKey,
}: UseFeatureSettingParams) => {
  const [settingValue, setSettingValue] = useState(() =>
    getApplicationVariable(variableKey),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);

  const updateSetting = async (isEnabled: boolean) => {
    if (isSaving) {
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

  return { settingValue, isSaving, hasSaveError, updateSetting };
};
