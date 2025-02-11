import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameHostnameToCustomDomain1739178177820
  implements MigrationInterface
{
  name = 'RenameHostnameToCustomDomain1739178177820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" RENAME COLUMN "hostname" TO "customDomain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" RENAME CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0" TO "UQ_900f0a3eb789159c26c8bcb39cd"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" RENAME CONSTRAINT "UQ_900f0a3eb789159c26c8bcb39cd" TO "UQ_e6fa363bdaf45cbf8ce97bcebf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" RENAME COLUMN "customDomain" TO "hostname"`,
    );
  }
}
