import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsUniqueToIndexMetadata1726757368825
  implements MigrationInterface
{
  name = 'AddIsUniqueToIndexMetadata1726757368825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."indexMetadata" ADD "isUnique" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."indexMetadata" DROP COLUMN "isUnique"`,
    );
  }
}
