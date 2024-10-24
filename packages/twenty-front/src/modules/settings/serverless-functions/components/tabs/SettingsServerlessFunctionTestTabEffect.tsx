import React, { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  DEFAULT_OUTPUT_VALUE,
  settingsServerlessFunctionOutputState,
} from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { settingsServerlessFunctionCodeEditorOutputParamsState } from '@/settings/serverless-functions/states/settingsServerlessFunctionCodeEditorOutputParamsState';

export const SettingsServerlessFunctionTestTabEffect = () => {
  const settingsServerlessFunctionOutput = useRecoilValue(
    settingsServerlessFunctionOutputState,
  );
  const setSettingsServerlessFunctionCodeEditorOutputParams = useSetRecoilState(
    settingsServerlessFunctionCodeEditorOutputParamsState,
  );
  useEffect(() => {
    if (settingsServerlessFunctionOutput.data !== DEFAULT_OUTPUT_VALUE) {
      setSettingsServerlessFunctionCodeEditorOutputParams({
        language: 'json',
        height: 300,
      });
    }
  }, [
    settingsServerlessFunctionOutput.data,
    setSettingsServerlessFunctionCodeEditorOutputParams,
  ]);
  return <></>;
};
