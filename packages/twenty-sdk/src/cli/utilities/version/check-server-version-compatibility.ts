import chalk from 'chalk';

import { CONTAINER_NAME } from '@/cli/utilities/server/docker-container';
import { getVersionInfo } from '@/cli/utilities/version/get-version-info';

const STALE_THRESHOLD_DAYS = 7;

export const checkServerVersionCompatibility = async (
  containerName: string = CONTAINER_NAME,
): Promise<void> => {
  const info = await getVersionInfo(containerName);

  if (
    info.localServerVersion === null ||
    info.latestServerVersion === null ||
    !info.isMinorOrMajorBehind ||
    info.daysBehind === null ||
    info.daysBehind <= STALE_THRESHOLD_DAYS
  ) {
    return;
  }

  console.warn(
    chalk.yellow(
      `⚠ Local Twenty server is v${info.localServerVersion} (${info.daysBehind} days behind v${info.latestServerVersion}).`,
    ),
  );
  console.warn(chalk.dim('  Update with: yarn twenty server upgrade'));
  console.warn('');
};
