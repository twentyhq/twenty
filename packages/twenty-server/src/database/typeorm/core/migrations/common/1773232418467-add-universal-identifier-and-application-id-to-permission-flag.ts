import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "universalIdentifier" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "applicationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_da8ffd3c24b4a819430a861067" ON "core"."permissionFlag" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_da8ffd3c24b4a819430a861067"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN "universalIdentifier"`,
    );
  }
}
