import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795257225899)
export class AddViewFieldRelationAggregateOperationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "core"."viewField_relationaggregateoperation_enum" AS ENUM(\'MIN\', \'MAX\', \'AVG\', \'SUM\', \'COUNT\', \'COUNT_UNIQUE_VALUES\', \'COUNT_EMPTY\', \'COUNT_NOT_EMPTY\', \'COUNT_TRUE\', \'COUNT_FALSE\', \'PERCENTAGE_EMPTY\', \'PERCENTAGE_NOT_EMPTY\')');
    await queryRunner.query('ALTER TABLE "core"."viewField" ADD "relationAggregateOperation" "core"."viewField_relationaggregateoperation_enum"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewField" DROP COLUMN "relationAggregateOperation"');
    await queryRunner.query('DROP TYPE "core"."viewField_relationaggregateoperation_enum"');
  }
}
