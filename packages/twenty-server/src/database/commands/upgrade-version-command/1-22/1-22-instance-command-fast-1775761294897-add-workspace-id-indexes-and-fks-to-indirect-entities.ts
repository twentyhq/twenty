import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.22.0', 1775761294897)
export class AddWorkspaceIdIndexesAndFksFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX "IDX_78ae6cfe5f49a76c4bf842ad58" ON "core"."applicationVariable" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_d8cf7f15cf6466ac0e3b443b3d" ON "core"."indexFieldMetadata" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_b8282d1e10fbb7856950f86c61" ON "core"."twoFactorAuthenticationMethod" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_70b398dc45219db8f3e36b3a07" ON "core"."agentMessagePart" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_c81d8fabdda94b7fa86fb6f1e7" ON "core"."agentTurnEvaluation" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_3d097ed53841d80904ed02c837" ON "core"."agentChatThread" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a4bb3c6176c2607693a6756ff6" ON "core"."agentTurn" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_75db4f2e80922078e8171ae130" ON "core"."agentMessage" ("workspaceId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "FK_78ae6cfe5f49a76c4bf842ad58b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."indexFieldMetadata" ADD CONSTRAINT "FK_d8cf7f15cf6466ac0e3b443b3d2" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationMethod" ADD CONSTRAINT "FK_b8282d1e10fbb7856950f86c616" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessagePart" ADD CONSTRAINT "FK_70b398dc45219db8f3e36b3a078" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentTurnEvaluation" ADD CONSTRAINT "FK_c81d8fabdda94b7fa86fb6f1e70" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatThread" ADD CONSTRAINT "FK_3d097ed53841d80904ed02c8373" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentTurn" ADD CONSTRAINT "FK_a4bb3c6176c2607693a6756ff6c" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" ADD CONSTRAINT "FK_75db4f2e80922078e8171ae130a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" DROP CONSTRAINT "FK_75db4f2e80922078e8171ae130a"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentTurn" DROP CONSTRAINT "FK_a4bb3c6176c2607693a6756ff6c"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT "FK_3d097ed53841d80904ed02c8373"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentTurnEvaluation" DROP CONSTRAINT "FK_c81d8fabdda94b7fa86fb6f1e70"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessagePart" DROP CONSTRAINT "FK_70b398dc45219db8f3e36b3a078"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationMethod" DROP CONSTRAINT "FK_b8282d1e10fbb7856950f86c616"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."indexFieldMetadata" DROP CONSTRAINT "FK_d8cf7f15cf6466ac0e3b443b3d2"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "FK_78ae6cfe5f49a76c4bf842ad58b"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_75db4f2e80922078e8171ae130"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_a4bb3c6176c2607693a6756ff6"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_3d097ed53841d80904ed02c837"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_c81d8fabdda94b7fa86fb6f1e7"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_70b398dc45219db8f3e36b3a07"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_b8282d1e10fbb7856950f86c61"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_d8cf7f15cf6466ac0e3b443b3d"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_78ae6cfe5f49a76c4bf842ad58"',
    );
  }
}
