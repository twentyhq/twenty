import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToObjectPermission1773317160558
  implements MigrationInterface
{
  name =
    'AddUniversalIdentifierAndApplicationIdToObjectPermission1773317160558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD "applicationId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP COLUMN IF EXISTS "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP COLUMN IF EXISTS "universalIdentifier"`,
    );
  }
}
