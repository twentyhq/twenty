import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveCanBeAssignedToApplications1766077618558
  implements MigrationInterface
{
  name = 'RemoveCanBeAssignedToApplications1766077618558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canBeAssignedToApplications"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canBeAssignedToApplications" boolean NOT NULL DEFAULT true`,
    );
  }
}
