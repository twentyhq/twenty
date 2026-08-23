import { defineLogicFunction } from 'twenty-sdk/define';
import axios, { type AxiosInstance } from "axios";
import {
  loadMigrationStateCheckpoint,
  migrationState,
  saveMigrationStateCheckpoint
} from "src/logic-functions/utils/migration-state.util";
import { startTimeBudget } from "src/logic-functions/utils/time-budget.util";
import { TIMEOUT_SECONDS } from "src/constants/timeout-seconds";
import { stage1 } from "src/logic-functions/stages/stage1";
import { stage2 } from "src/logic-functions/stages/stage2";
import { stage3 } from "src/logic-functions/stages/stage3";
import { stage4 } from "src/logic-functions/stages/stage4";
import { stage5 } from "src/logic-functions/stages/stage5";
import { stage6 } from "src/logic-functions/stages/stage6";
import { stage7 } from "src/logic-functions/stages/stage7";
import { stage8 } from "src/logic-functions/stages/stage8";
import { TRIGGER_ROUTE_PATH } from "src/constants/trigger-route-path";
import { logger } from "src/logic-functions/utils/logger.util";

// On purpose for bigger requests like FindAllObjectsAndFields
const API_CLIENT_TIMEOUT_MS = 60 * 1000;

const handler = async () => {
  if (process.env.TARGET_WORKSPACE_API_URL === undefined ||
    process.env.TARGET_WORKSPACE_API_KEY === undefined ||
    process.env.SOURCE_WORKSPACE_API_URL === undefined ||
    process.env.SOURCE_WORKSPACE_API_KEY === undefined) {
    logger.error('Missing variables, add them in Settings > Apps > Installed > Workspace migration > Settings');
    return;
  }
  startTimeBudget();

  const targetWorkspace = axios.create({
    baseURL: `${process.env.TARGET_WORKSPACE_API_URL}`,
    timeout: API_CLIENT_TIMEOUT_MS,
    headers: {
      'Authorization': `Bearer ${process.env.TARGET_WORKSPACE_API_KEY}`,
    }
  });
  const sourceWorkspace = axios.create({
    baseURL: `${process.env.SOURCE_WORKSPACE_API_URL}`,
    timeout: API_CLIENT_TIMEOUT_MS,
    headers: {
      'Authorization': `Bearer ${process.env.SOURCE_WORKSPACE_API_KEY}`,
    }
  });

  await loadMigrationStateCheckpoint();

  try {
    await dispatchStage(sourceWorkspace, targetWorkspace);
  } catch (error) {
    logger.error(`Migration failed during stage ${migrationState.stage}: ${error instanceof Error ? error.message : String(error)}`);
    await saveMigrationStateCheckpoint();
    throw error;
  }
};

const dispatchStage = async (sourceWorkspace: AxiosInstance, targetWorkspace: AxiosInstance) => {
  switch (migrationState.stage) {
    case 1:
      await stage1(sourceWorkspace, targetWorkspace);
      break;
    case 2:
      await stage2(targetWorkspace);
      break;
    case 3:
      await stage3(sourceWorkspace, targetWorkspace);
      break;
    case 4:
      await stage4(sourceWorkspace, targetWorkspace);
      break;
    case 5:
      await stage5(sourceWorkspace, targetWorkspace);
      break;
    case 6:
      await stage6(sourceWorkspace, targetWorkspace);
      break;
    case 7:
      await stage7(sourceWorkspace, targetWorkspace);
      break;
    case 8:
      await stage8(sourceWorkspace, targetWorkspace);
      break;
    case 9:
      logger.log('Migration already completed - nothing to do');
      break;
  }
};

export default defineLogicFunction({
  universalIdentifier: 'b058e57c-4ac6-4b18-b147-9099260da9de',
  name: 'entry-point',
  description: 'Add a description for your logic function',
  timeoutSeconds: TIMEOUT_SECONDS,
  handler,
  httpRouteTriggerSettings: {
    path: TRIGGER_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
