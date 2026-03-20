import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "applicationId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN IF EXISTS "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN IF EXISTS "universalIdentifier"`,
    );
  }
}
