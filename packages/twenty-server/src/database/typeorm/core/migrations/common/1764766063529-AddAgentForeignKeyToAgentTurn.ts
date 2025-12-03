import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAgentForeignKeyToAgentTurn1764766063529
  implements MigrationInterface
{
  name = 'AddAgentForeignKeyToAgentTurn1764766063529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" ADD CONSTRAINT "FK_e6d7c07f32e6f0f08cf639d4f5c" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" DROP CONSTRAINT "FK_e6d7c07f32e6f0f08cf639d4f5c"`,
    );
  }
}
