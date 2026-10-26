import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.52.0', 1793032106701)
export class AddRecordPermissionRevisionsAndCapabilitiesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."recordPermissionRevision" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "definition" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT \'building\', "previousRevisionId" uuid, "failureReason" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_634dc8de0c2479c74d57f39f25d" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_b3f7c78321a20a963b25ef2435" ON "core"."recordPermissionRevision" ("workspaceId", "status") ');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" ADD "recordCapabilities" jsonb');
    await queryRunner.query('ALTER TABLE "core"."recordPermissionRevision" ADD CONSTRAINT "FK_8dfa2f6e4724b43fb0ff926b79d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."recordPermissionRevision" DROP CONSTRAINT "FK_8dfa2f6e4724b43fb0ff926b79d"');
    await queryRunner.query('ALTER TABLE "core"."objectMetadata" DROP COLUMN "recordCapabilities"');
    await queryRunner.query('DROP INDEX "core"."IDX_b3f7c78321a20a963b25ef2435"');
    await queryRunner.query('DROP TABLE "core"."recordPermissionRevision"');
  }
}
