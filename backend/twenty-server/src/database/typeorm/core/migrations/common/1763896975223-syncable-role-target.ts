import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class SyncableRoleTarget1763896975223 implements MigrationInterface {
  name = 'SyncableRoleTarget1763896975223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3e571e80f99488686015f3d00c" ON "core"."roleTargets" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "FK_d4fcfdc3cd562a3e81fa9f0dae5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "FK_d4fcfdc3cd562a3e81fa9f0dae5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3e571e80f99488686015f3d00c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP COLUMN "universalIdentifier"`,
    );
  }
}
