import { type QueryRunner } from 'typeorm';

import {
  COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT,
  COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL,
} from 'src/engine/metadata-modules/command-menu-item/constants/command-menu-item-engine-key-coherence-constraint-sql.constant';

export const addPayloadCheckConstraintToCommandMenuItem = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  await queryRunner.query(
    `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT}"`,
  );

  await queryRunner.query(
    `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT}" CHECK (${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL})`,
  );
};
