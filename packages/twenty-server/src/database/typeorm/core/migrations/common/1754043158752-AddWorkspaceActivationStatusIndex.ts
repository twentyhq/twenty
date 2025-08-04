import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceActivationStatusIndex1754043158752
  implements MigrationInterface
{
  name = 'AddWorkspaceActivationStatusIndex1754043158752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_WORKSPACE_ACTIVATION_STATUS" ON "core"."workspace" ("activationStatus") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_WORKSPACE_ACTIVATION_STATUS"`,
    );
  }
}
