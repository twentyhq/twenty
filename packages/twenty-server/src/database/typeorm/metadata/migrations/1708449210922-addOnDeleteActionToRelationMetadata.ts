import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteActionToRelationMetadata1708449210922
  implements MigrationInterface
{
  name = 'AddOnDeleteActionToRelationMetadata1708449210922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "metadata"."relationMetadata_ondeleteaction_enum" AS ENUM('CASCADE', 'RESTRICT', 'SET_NULL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD "onDeleteAction" "metadata"."relationMetadata_ondeleteaction_enum" NOT NULL DEFAULT 'SET_NULL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP COLUMN "onDeleteAction"`,
    );
    await queryRunner.query(
      `DROP TYPE "metadata"."relationMetadata_ondeleteaction_enum"`,
    );
  }
}
