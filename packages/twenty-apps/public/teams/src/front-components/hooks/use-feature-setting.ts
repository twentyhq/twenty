import { useState } from 'react';
import { getApplicationVariable } from 'twenty-sdk/front-component';

import { saveFeatureSetting } from 'src/front-components/utils/save-feature-setting';

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

  const updateSetting = async (isEnabled: boolean) => {
    if (!isAvailable || isSaving) {
      return;
    }

    setIsSaving(true);
    setHasSaveError(false);

    try {
      await saveFeatureSetting({ variableKey, isEnabled });
      setSettingValue(String(isEnabled));
    } catch {
      setHasSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return { settingValue, isSaving, hasSaveError, updateSetting };
};
