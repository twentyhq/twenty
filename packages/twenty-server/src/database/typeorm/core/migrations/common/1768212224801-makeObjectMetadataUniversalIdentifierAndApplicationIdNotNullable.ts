import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableQueries } from 'src/database/typeorm/core/migrations/utils/1768212224801-makeObjectMetadataUniversalIdentifierAndApplicationIdNotNullable.util';

export class MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullable1768212224801
  implements MigrationInterface
{
  name =
    'MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullable1768212224801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_object_metadata_universal_identifier_and_application_id_not_nullable';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableQueries(
        queryRunner,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullable1768212224801',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullable1768212224801 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_71a7af5a5c916f0b96f358f25f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3a00d35710f4227ded320fd96d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3a00d35710f4227ded320fd96d" ON "core"."objectMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_71a7af5a5c916f0b96f358f25f7" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
