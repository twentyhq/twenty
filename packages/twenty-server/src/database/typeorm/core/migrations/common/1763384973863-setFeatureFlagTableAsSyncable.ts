import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class SetFeatureFlagTableAsSyncable1763384973863
  implements MigrationInterface
{
  name = 'SetFeatureFlagTableAsSyncable1763384973863';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0ea4e1c8246c84f34671dbdb3f" ON "core"."featureFlag" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD CONSTRAINT "FK_a4a5f96374ade1d39e8ddb66805" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP CONSTRAINT "FK_a4a5f96374ade1d39e8ddb66805"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_0ea4e1c8246c84f34671dbdb3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP COLUMN "universalIdentifier"`,
    );
  }
}
