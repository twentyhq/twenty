import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDuplicateCriteriaColumnInObjectMetadata1738853620654
  implements MigrationInterface
{
  name = 'AddDuplicateCriteriaColumnInObjectMetadata1738853620654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "duplicateCriteria" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "duplicateCriteria"`,
    );
  }
}
