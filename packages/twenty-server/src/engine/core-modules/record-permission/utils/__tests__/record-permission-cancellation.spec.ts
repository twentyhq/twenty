import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { RecordPermissionPolicyService } from 'src/engine/core-modules/record-permission/services/record-permission-policy.service';
import { type RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const connectionString = process.env.RECORD_PERMISSION_TEST_DATABASE_URL;
(connectionString ? describe : describe.skip)(
  'Record permission cancellation through TypeORM',
  () => {
    jest.useRealTimers();
    const workspaceId = v4();
    const schema = '"' + getWorkspaceSchemaName(workspaceId) + '"';
    const activeRevisionId = v4();
    const candidateRevisionId = v4();
    const dataSource = new DataSource({
      type: 'postgres',
      url: connectionString,
    });
    const service = new RecordPermissionPolicyService(
      dataSource,
      {} as WorkspaceCacheService,
      {} as RowLevelPermissionPredicateService,
    );
    beforeAll(async () => {
      await dataSource.initialize();
      await dataSource.query(`CREATE SCHEMA ${schema}`);
      await dataSource.query(
        `CREATE TABLE ${schema}."recordPermissionState" (id boolean, "activeRevisionId" uuid,"candidateRevisionId" uuid)`,
      );
      await dataSource.query(
        `INSERT INTO ${schema}."recordPermissionState" VALUES (true,$1,$2)`,
        [activeRevisionId, candidateRevisionId],
      );
    });
    afterAll(async () => {
      await dataSource.query(`DROP SCHEMA ${schema} CASCADE`);
      await dataSource.destroy();
    });
    it('rejects an active or stale revision without cancelling the pending revision', async () => {
      for (const revisionId of [activeRevisionId, v4()])
        await expect(
          service.cancelCandidate(workspaceId, revisionId),
        ).rejects.toThrow('This candidate is no longer pending');
      expect(
        await dataSource.query(
          `SELECT "activeRevisionId","candidateRevisionId" FROM ${schema}."recordPermissionState"`,
        ),
      ).toEqual([{ activeRevisionId, candidateRevisionId }]);
    });
  },
);
