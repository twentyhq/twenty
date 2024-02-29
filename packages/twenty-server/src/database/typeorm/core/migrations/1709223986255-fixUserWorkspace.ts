import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserWorkspace1709223986255 implements MigrationInterface {
  name = 'FixUserWorkspace1709223986255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "deletedAt" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ALTER COLUMN "deletedAt" SET NOT NULL`,
    );
  }
}
