import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyValuePairTableUniqueContraints1717688588972
  implements MigrationInterface
{
  name = 'AddKeyValuePairTableUniqueContraints1717688588972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IndexOnKeyUserIdAndNullWorkspaceIdUnique" ON "core"."keyValuePair" ("key", "userId") WHERE "workspaceId" is NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IndexOnKeyWorkspaceIdAndNullUserIdUnique" ON "core"."keyValuePair" ("key", "workspaceId") WHERE "userId" is NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnKeyWorkspaceIdAndNullUserIdUnique"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnKeyUserIdAndNullWorkspaceIdUnique"`,
    );
  }
}
