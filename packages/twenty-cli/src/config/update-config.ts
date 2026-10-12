import { readConfig } from '@/config/read-config';
import { type ConfigFile } from '@/config/types/config-file.type';
import { withConfigLock } from '@/config/with-config-lock';
import { writeConfigAtomically } from '@/config/write-config-atomically';

export const updateConfig = <TResult>({
  configPath,
  signal,
  update,
}: {
  configPath: string;
  signal: AbortSignal;
  update: (config: ConfigFile) => { config: ConfigFile; result: TResult };
}) =>
  withConfigLock({
    configPath,
    signal,
    operation: async () => {
      const { config, result } = update(await readConfig(configPath));

      signal.throwIfAborted();
      await writeConfigAtomically(configPath, config);

      return result;
    },
  });
