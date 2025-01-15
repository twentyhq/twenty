import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPublicToFeatureFlag1736927618072
  implements MigrationInterface
{
  name = 'AddIsPublicToFeatureFlag1736927618072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD "isPublic" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP COLUMN "isPublic"`,
    );
  }
}
