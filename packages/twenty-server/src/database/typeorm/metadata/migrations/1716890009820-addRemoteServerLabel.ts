import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemoteServerLabel1716890009820 implements MigrationInterface {
  name = 'AddRemoteServerLabel1716890009820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."remoteServer" ADD "label" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."remoteServer" DROP COLUMN "label"`,
    );
  }
}
