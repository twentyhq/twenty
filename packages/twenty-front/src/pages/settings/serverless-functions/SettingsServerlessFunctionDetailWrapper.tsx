import { ResetServerlessFunctionStatesEffect } from '~/pages/settings/serverless-functions/ResetServerlessFunctionStatesEffect';
import { SettingsServerlessFunctionDetail } from '~/pages/settings/serverless-functions/SettingsServerlessFunctionDetail';

export const SettingsServerlessFunctionDetailWrapper = () => {
  return (
    <>
      <ResetServerlessFunctionStatesEffect />
      <SettingsServerlessFunctionDetail />
    </>
  );
};
