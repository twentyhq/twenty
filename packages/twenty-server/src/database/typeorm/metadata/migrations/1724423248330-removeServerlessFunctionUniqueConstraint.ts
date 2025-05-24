import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveServerlessFunctionUniqueConstraint1724423248330
  implements MigrationInterface
{
  name = 'RemoveServerlessFunctionUniqueConstraint1724423248330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "IndexOnNameAndWorkspaceIdUnique"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "IndexOnNameAndWorkspaceIdUnique" UNIQUE ("name", "workspaceId")`,
    );
  }
}
