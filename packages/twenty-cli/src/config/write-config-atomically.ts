import { randomUUID } from 'node:crypto';
import { open, rename, rm } from 'node:fs/promises';

import { CONFIG_FILE_MODE } from '@/config/constants/config-file-mode.constant';
import { type ConfigFile } from '@/config/types/config-file.type';

export const writeConfigAtomically = async (
  configPath: string,
  config: ConfigFile,
) => {
  const temporaryPath = `${configPath}.${process.pid}.${randomUUID()}.tmp`;
  const temporaryFile = await open(
    temporaryPath,
    'wx',
    CONFIG_FILE_MODE.PRIVATE_FILE,
  );

  try {
    await temporaryFile.writeFile(`${JSON.stringify(config, null, 2)}\n`);
    await temporaryFile.sync();
    await temporaryFile.close();
    await rename(temporaryPath, configPath);
  } catch (error) {
    await temporaryFile.close().catch(() => undefined);
    await rm(temporaryPath, { force: true });

    throw error;
  }
};
