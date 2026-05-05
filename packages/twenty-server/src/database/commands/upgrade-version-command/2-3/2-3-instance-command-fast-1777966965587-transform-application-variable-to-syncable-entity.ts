import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.3.0', 1777966965587)
export class TransformApplicationVariableToSyncableEntityFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_78ae6cfe5f49a76c4bf842ad58"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "IDX_APPLICATION_VARIABLE_KEY_APPLICATION_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD "universalIdentifier" uuid',
    );
    await queryRunner.query(
      'UPDATE "core"."applicationVariable" SET "universalIdentifier" = gen_random_uuid() WHERE "universalIdentifier" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ALTER COLUMN "universalIdentifier" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD "deletedAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "FK_51adb49e7f8df35dd23e01c4830"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ALTER COLUMN "applicationId" SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_44ecebdf70cbed17f89527b36b" ON "core"."applicationVariable" ("workspaceId", "universalIdentifier") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "FK_51adb49e7f8df35dd23e01c4830" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "FK_51adb49e7f8df35dd23e01c4830"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_44ecebdf70cbed17f89527b36b"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ALTER COLUMN "applicationId" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "FK_51adb49e7f8df35dd23e01c4830" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP COLUMN "deletedAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP COLUMN "universalIdentifier"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "IDX_APPLICATION_VARIABLE_KEY_APPLICATION_ID_UNIQUE" UNIQUE ("key", "applicationId")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_78ae6cfe5f49a76c4bf842ad58" ON "core"."applicationVariable" ("workspaceId") ',
    );
  }
}
