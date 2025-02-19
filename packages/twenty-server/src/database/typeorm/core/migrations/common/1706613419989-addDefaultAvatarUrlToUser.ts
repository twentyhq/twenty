import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultAvatarUrlToUser1706613419989
  implements MigrationInterface
{
  name = 'AddDefaultAvatarUrlToUser1706613419989';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "defaultAvatarUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "defaultAvatarUrl"`,
    );
  }
}
