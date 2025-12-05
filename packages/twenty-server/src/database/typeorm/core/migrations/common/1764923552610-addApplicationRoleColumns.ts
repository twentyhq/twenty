import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationRoleColumns1764923552610
  implements MigrationInterface
{
  name = 'AddApplicationRoleColumns1764923552610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD "targetApplicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canBeAssignedToApplications" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canBeAssignedToApplications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP COLUMN "targetApplicationId"`,
    );
  }
}
