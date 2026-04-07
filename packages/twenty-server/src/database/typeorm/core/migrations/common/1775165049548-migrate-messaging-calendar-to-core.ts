import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateMessagingCalendarToCore1775165049548
  implements MigrationInterface
{
  name = 'MigrateMessagingCalendarToCore1775165049548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ALTER COLUMN "parentFolderId" TYPE character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ALTER COLUMN "parentFolderId" TYPE uuid USING "parentFolderId"::uuid`,
    );
  }
}
