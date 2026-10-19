import { checkNodeRequirement } from '@/app/project/check-node-requirement';
import { CLI_NODE_VERSION_RANGE } from '@/constants/cli-node-version-range.constant';

type CliModule = { runCli: (args: string[]) => Promise<void> };

export const startCli = async ({
  args,
  nodeVersion,
  loadCli,
}: {
  args: string[];
  nodeVersion: string;
  loadCli: () => Promise<CliModule>;
}) => {
  const isNodeSupported =
    checkNodeRequirement({
      version: nodeVersion,
      range: CLI_NODE_VERSION_RANGE,
    }) === 'satisfied';

  if (!isNodeSupported) {
    process.stderr.write(
      `twenty requires Node.js ${CLI_NODE_VERSION_RANGE}; this is Node.js ${nodeVersion}. Switch to a supported Node.js version, then try again.\n`,
    );
    process.exitCode = 1;

    return;
  }

  const cli = await loadCli();

  await cli.runCli(args);
};
