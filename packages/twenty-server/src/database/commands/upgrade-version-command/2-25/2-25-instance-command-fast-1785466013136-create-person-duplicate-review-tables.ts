import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1785466013136)
export class CreatePersonDuplicateReviewTablesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."personRecordMerge" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sourcePersonId" uuid NOT NULL, "targetPersonId" uuid NOT NULL, "mergedByWorkspaceMemberId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b4261dff83b659c991f74ec85ac" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_PERSON_RECORD_MERGE_TARGET_PERSON_ID" ON "core"."personRecordMerge" ("workspaceId", "targetPersonId") ');
    await queryRunner.query('CREATE INDEX "IDX_PERSON_RECORD_MERGE_SOURCE_PERSON_ID" ON "core"."personRecordMerge" ("workspaceId", "sourcePersonId") ');
    await queryRunner.query('CREATE INDEX "IDX_PERSON_RECORD_MERGE_WORKSPACE_ID" ON "core"."personRecordMerge" ("workspaceId") ');
    await queryRunner.query('CREATE TABLE "core"."personDuplicatePairDecision" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "leftPersonId" uuid NOT NULL, "rightPersonId" uuid NOT NULL, "leftFingerprint" character varying(64) NOT NULL, "rightFingerprint" character varying(64) NOT NULL, "resolvedByWorkspaceMemberId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_50fda706cce3d551f2c9f000bbb" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_PERSON_DUPLICATE_PAIR_DECISION_WORKSPACE_ID" ON "core"."personDuplicatePairDecision" ("workspaceId") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_PERSON_DUPLICATE_PAIR_DECISION_WORKSPACE_PAIR" ON "core"."personDuplicatePairDecision" ("workspaceId", "leftPersonId", "rightPersonId") ');
    await queryRunner.query('ALTER TABLE "core"."personRecordMerge" ADD CONSTRAINT "FK_f5a6cf9c7ef4a94cf562c754e36" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."personDuplicatePairDecision" ADD CONSTRAINT "FK_1e2430f200de2bc45afc5348d75" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."personDuplicatePairDecision" DROP CONSTRAINT "FK_1e2430f200de2bc45afc5348d75"');
    await queryRunner.query('ALTER TABLE "core"."personRecordMerge" DROP CONSTRAINT "FK_f5a6cf9c7ef4a94cf562c754e36"');
    await queryRunner.query('DROP INDEX "core"."IDX_PERSON_DUPLICATE_PAIR_DECISION_WORKSPACE_PAIR"');
    await queryRunner.query('DROP INDEX "core"."IDX_PERSON_DUPLICATE_PAIR_DECISION_WORKSPACE_ID"');
    await queryRunner.query('DROP TABLE "core"."personDuplicatePairDecision"');
    await queryRunner.query('DROP INDEX "core"."IDX_PERSON_RECORD_MERGE_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PERSON_RECORD_MERGE_SOURCE_PERSON_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PERSON_RECORD_MERGE_TARGET_PERSON_ID"');
    await queryRunner.query('DROP TABLE "core"."personRecordMerge"');
  }
}
