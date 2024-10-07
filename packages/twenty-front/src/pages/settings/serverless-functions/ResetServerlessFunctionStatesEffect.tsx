import { settingsServerlessFunctionCodeEditorOutputParamsState } from '@/settings/serverless-functions/states/settingsServerlessFunctionCodeEditorOutputParamsState';
import { settingsServerlessFunctionInputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionOutputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { useResetRecoilState } from 'recoil';
import { useEffect } from 'react';

export const ResetServerlessFunctionStatesEffect = () => {
  const resetSettingsServerlessFunctionInput = useResetRecoilState(
    settingsServerlessFunctionInputState,
  );
  const resetSettingsServerlessFunctionOutput = useResetRecoilState(
    settingsServerlessFunctionOutputState,
  );
  const resetSettingsServerlessFunctionCodeEditorOutputParamsState =
    useResetRecoilState(settingsServerlessFunctionCodeEditorOutputParamsState);

  useEffect(() => {
    resetSettingsServerlessFunctionInput();
    resetSettingsServerlessFunctionOutput();
    resetSettingsServerlessFunctionCodeEditorOutputParamsState();
  }, [
    resetSettingsServerlessFunctionInput,
    resetSettingsServerlessFunctionOutput,
    resetSettingsServerlessFunctionCodeEditorOutputParamsState,
  ]);
  return <></>;
};
