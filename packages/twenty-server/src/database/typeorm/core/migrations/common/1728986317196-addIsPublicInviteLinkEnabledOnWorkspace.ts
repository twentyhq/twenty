import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPublicInviteLinkEnabledOnWorkspace1728986317196
  implements MigrationInterface
{
  name = 'AddIsPublicInviteLinkEnabledOnWorkspace1728986317196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isPublicInviteLinkEnabled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE  "core"."workspace" DROP COLUMN "isPublicInviteLinkEnabled"`,
    );
  }
}
