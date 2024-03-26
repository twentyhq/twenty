import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsRemoteField1711466822763 implements MigrationInterface {
  name = 'AddIsRemoteField1711466822763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "isRemote" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "isRemote"`,
    );
  }
}
