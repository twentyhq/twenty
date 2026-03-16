import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorToObjectMetadata1773655278357
  implements MigrationInterface
{
  name = 'AddColorToObjectMetadata1773655278357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "color" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "color"`,
    );
  }
}
