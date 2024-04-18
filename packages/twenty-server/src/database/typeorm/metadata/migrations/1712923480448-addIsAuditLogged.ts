import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAuditLogged1712923480448 implements MigrationInterface {
  name = 'AddIsAuditLogged1712923480448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "isAuditLogged" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "isAuditLogged"`,
    );
  }
}
