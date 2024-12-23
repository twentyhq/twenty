import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHostnameToWorkspace1734538670589 implements MigrationInterface {
  name = 'AddHostnameToWorkspace1734538670589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" RENAME COLUMN "domainName" TO "hostname"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0" UNIQUE ("hostname")`,
    );
    await queryRunner.query(`UPDATE "core"."workspace" SET "hostname" = NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" RENAME COLUMN "hostname" TO "domainName"`,
    );
  }
}
