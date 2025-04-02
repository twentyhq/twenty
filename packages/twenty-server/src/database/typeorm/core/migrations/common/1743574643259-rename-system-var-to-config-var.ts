import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSystemVarToConfigVar1721139150488
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."keyValuePair_type_enum" RENAME VALUE 'SYSTEM_VAR' TO 'CONFIG_VAR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."keyValuePair_type_enum" RENAME VALUE 'CONFIG_VAR' TO 'SYSTEM_VAR'`,
    );
  }
}
