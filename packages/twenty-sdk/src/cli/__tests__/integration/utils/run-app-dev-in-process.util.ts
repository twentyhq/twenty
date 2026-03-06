import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';

import { AppDevCommand } from '@/cli/commands/app/app-dev';
import { pathExists } from '@/cli/utilities/file/fs-utils';

export type RunAppDevResult = {
  success: boolean;
  events?: { message: string; status: string }[];
  stepStatuses?: Record<string, string>;
};

// Waits for a full sync cycle to complete: pipeline must have started
// syncing at least once and then returned to idle (isSyncing === false).
export const runAppDevInProcess = async (options: {
  appPath: string;
  timeout?: number;
}): Promise<RunAppDevResult> => {
  const { appPath, timeout = 30_000 } = options;
  const manifestPath = join(appPath, OUTPUT_DIR, 'manifest.json');

  const command = new AppDevCommand();

  await command.execute({ appPath, headless: true });

  const startTime = Date.now();
  let sawSyncing = false;

  while (Date.now() - startTime < timeout) {
    const state = command.getOrchestrator()?.getState();

    if (state?.pipeline.isSyncing) {
      sawSyncing = true;
    }

    if (sawSyncing && !state?.pipeline.isSyncing) {
      if (await pathExists(manifestPath)) {
        await command.close();

        return { success: true };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const state = command.getOrchestrator()?.getState();

  const events = state?.events.map((event) => ({
    message: event.message,
    status: event.status,
  }));

  const stepStatuses = state
    ? Object.fromEntries(
        Object.entries(state.steps).map(([key, step]) => [key, step.status]),
      )
    : undefined;

  await command.close();

  return { success: false, events, stepStatuses };
};
