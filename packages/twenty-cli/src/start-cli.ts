import { engines } from '../package.json';

import { checkNodeRequirement } from '@/app/project/check-node-requirement';

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
    checkNodeRequirement({ version: nodeVersion, range: engines.node }) ===
    'satisfied';
  let cli: CliModule;

  try {
    cli = await loadCli();
  } catch (error) {
    if (isNodeSupported) {
      throw error;
    }

    process.stderr.write(
      `twenty requires Node.js ${engines.node}; this is Node.js ${nodeVersion}. Switch to a supported Node.js version, then try again.\n`,
    );
    process.exitCode = 1;

    return;
  }

  await cli.runCli(args);
};
