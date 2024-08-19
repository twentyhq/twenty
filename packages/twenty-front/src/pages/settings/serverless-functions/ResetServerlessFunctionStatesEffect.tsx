import { settingsServerlessFunctionCodeEditorOutputParamsState } from '@/settings/serverless-functions/states/settingsServerlessFunctionCodeEditorOutputParamsState';
import { settingsServerlessFunctionInputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionOutputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { useResetRecoilState } from 'recoil';

export const ResetServerlessFunctionStatesEffect = () => {
  const resetSettingsServerlessFunctionInput = useResetRecoilState(
    settingsServerlessFunctionInputState,
  );
  const resetSettingsServerlessFunctionOutput = useResetRecoilState(
    settingsServerlessFunctionOutputState,
  );
  const resetSettingsServerlessFunctionCodeEditorOutputParamsState =
    useResetRecoilState(settingsServerlessFunctionCodeEditorOutputParamsState);

  resetSettingsServerlessFunctionInput();
  resetSettingsServerlessFunctionOutput();
  resetSettingsServerlessFunctionCodeEditorOutputParamsState();
  return <></>;
};
