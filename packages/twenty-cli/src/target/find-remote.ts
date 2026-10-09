import { type ConfigFile } from '@/config/types/config-file.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const findRemote = (config: ConfigFile, remoteName: string) => {
  if (!Object.hasOwn(config.remotes, remoteName)) {
    throw new CliError({
      code: 'UNKNOWN_REMOTE',
      exitCode: EXIT_CODE.USAGE,
      message: `No remote is named ${remoteName}.`,
      hint: 'See saved remotes: twenty remote list',
      details: { remote: remoteName },
    });
  }

  return config.remotes[remoteName];
};
