import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHostnameToWorkspace1737997028359 implements MigrationInterface {
  name = 'AddHostnameToWorkspace1737997028359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "hostname" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0" UNIQUE ("hostname")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "hostname"`,
    );
  }
}
