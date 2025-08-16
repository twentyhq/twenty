import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIsUIReadOnlyToFieldMetadata1755000000000
  implements MigrationInterface
{
  name = 'AddIsUIReadOnlyToFieldMetadata1755000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "isUIReadOnly" boolean NOT NULL DEFAULT false`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "isUIReadOnly" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "isUIReadOnly"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "isUIReadOnly"`,
    );
  }
}
