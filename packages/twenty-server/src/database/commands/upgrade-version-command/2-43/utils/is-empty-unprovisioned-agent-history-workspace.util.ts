import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { type AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

// Older installations can retain empty workspace records without a physical
// schema. The 2.42 history move skips them, so later history commands must too.
export const isEmptyUnprovisionedAgentHistoryWorkspace = async ({
  dataSource,
  agentHistoryStorageService,
  workspaceId,
}: {
  dataSource: DataSource;
  agentHistoryStorageService: AgentHistoryStorageService;
  workspaceId: string;
}): Promise<boolean> => {
  const runner = dataSource.createQueryRunner('master');
  try {
    await runner.connect();
    if (await runner.hasSchema(getWorkspaceSchemaName(workspaceId))) {
      return false;
    }
    const state = await agentHistoryStorageService.readState(
      runner,
      workspaceId,
    );
    if (state.storage === 'workspace' || isDefined(state.migration)) {
      return false;
    }
    const history = await runner.query(
      `SELECT 1 WHERE ${AGENT_HISTORY_OBJECT_NAMES.map(
        (name) =>
          `EXISTS (SELECT 1 FROM core."${name}" WHERE "workspaceId" = $1)`,
      ).join(' OR ')}`,
      [workspaceId],
    );
    return !isNonEmptyArray(history);
  } finally {
    await runner.release();
  }
};
