import { type CommandRun } from '@/catalog/types/command-run.type';
import { CLI_VERSION } from '@/constants/cli-version.constant';
import { dimText } from '@/output/style';

export const runVersionCommand: CommandRun = async () => {
  const versionInformation = {
    version: CLI_VERSION,
    node: process.versions.node,
    platform: process.platform,
    arch: process.arch,
  };

  return {
    data: versionInformation,
    human: `twenty ${versionInformation.version} ${dimText(
      `(node ${versionInformation.node}, ${versionInformation.platform}-${versionInformation.arch})`,
    )}`,
  };
};
