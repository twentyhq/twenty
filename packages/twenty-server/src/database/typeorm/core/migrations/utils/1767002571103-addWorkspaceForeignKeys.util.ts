import { type QueryRunner } from 'typeorm';

export const addWorkspaceForeignKeysQueries = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  await queryRunner.query(
    `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "FK_5c988136a6d6f25a100c1064789" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_a86894bed7b7e1cc8b3f1d6186f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."role" ADD CONSTRAINT "FK_d2532f520d84f8c22ee45681c5a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_9ce5ba7878f498bcf79e447a9a6" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_d82a05a204136c01388ea80bc7a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_058c319eeb9799a4637908ce362" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_cf158c3199dcf2d52b0da05c33b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."routeTrigger" ADD CONSTRAINT "FK_5e004929fcf5e67398544b43885" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_ef5dde6a681970b9c1e10563498" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."dataSource" ADD CONSTRAINT "FK_e1914827ee8b22fba4254578311" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "FK_edcd87df18d3284141757bf6e16" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."permissionFlag" ADD CONSTRAINT "FK_835bc9f7ef959debfc5cd268049" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."serverlessFunctionLayer" ADD CONSTRAINT "FK_ca0699c3c906e903d7381c6a771" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."workspaceMigration" ADD CONSTRAINT "FK_bebfcf8dcb299fd39ad04ed4c7f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."remoteTable" ADD CONSTRAINT "FK_30b429b14ddc6aab7495fa884f3" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."remoteServer" ADD CONSTRAINT "FK_d1293835c5a0bb89fc0ed45713f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
  );
};
