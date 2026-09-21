import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789992264012)
export class AddDeferredSchemaOperationTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."deferredSchemaOperation" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "status" character varying NOT NULL DEFAULT \'PENDING\', "indexMetadataId" uuid NOT NULL, "attempts" integer NOT NULL DEFAULT \'0\', "lastError" text, "startedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_db2363e42010d456550f4146f1d" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_DEFERRED_SCHEMA_OPERATION_INDEX_METADATA_ID_UNIQUE" ON "core"."deferredSchemaOperation" ("indexMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_DEFERRED_SCHEMA_OPERATION_WORKSPACE_ID_STATUS" ON "core"."deferredSchemaOperation" ("workspaceId", "status") ');
    await queryRunner.query('ALTER TABLE "core"."deferredSchemaOperation" ADD CONSTRAINT "FK_e0bfad037e718db71ccf3a2429b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."deferredSchemaOperation" ADD CONSTRAINT "FK_a3edaa3319f75744292a7467ad5" FOREIGN KEY ("indexMetadataId") REFERENCES "core"."indexMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."deferredSchemaOperation" DROP CONSTRAINT "FK_a3edaa3319f75744292a7467ad5"');
    await queryRunner.query('ALTER TABLE "core"."deferredSchemaOperation" DROP CONSTRAINT "FK_e0bfad037e718db71ccf3a2429b"');
    await queryRunner.query('DROP INDEX "core"."IDX_DEFERRED_SCHEMA_OPERATION_WORKSPACE_ID_STATUS"');
    await queryRunner.query('DROP INDEX "core"."IDX_DEFERRED_SCHEMA_OPERATION_INDEX_METADATA_ID_UNIQUE"');
    await queryRunner.query('DROP TABLE "core"."deferredSchemaOperation"');
  }
}
