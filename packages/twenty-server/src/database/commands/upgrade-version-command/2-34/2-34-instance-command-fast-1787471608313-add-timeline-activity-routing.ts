import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.34.0', 1787471608313)
export class AddTimelineActivityRoutingFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" ADD "targetRelationFieldUniversalIdentifier" uuid');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" ADD "triggerFieldUniversalIdentifiers" uuid[]');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" DROP COLUMN "triggerFieldUniversalIdentifiers"');
    await queryRunner.query('ALTER TABLE "core"."timelineActivityType" DROP COLUMN "targetRelationFieldUniversalIdentifier"');
  }
}
