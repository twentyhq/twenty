import { getConfigPath } from '@/config/get-config-path';
import { readConfig } from '@/config/read-config';
import { selectTarget } from '@/target/select-target';

export const hasConfiguredTarget = ({
  environment,
  remoteFlag,
}: {
  environment: NodeJS.ProcessEnv;
  remoteFlag: string | undefined;
}) =>
  selectTarget({
    environment,
    remoteFlag,
    loadConfig: () => readConfig(getConfigPath()),
    warn: () => undefined,
  }).then(
    () => true,
    () => false,
  );
