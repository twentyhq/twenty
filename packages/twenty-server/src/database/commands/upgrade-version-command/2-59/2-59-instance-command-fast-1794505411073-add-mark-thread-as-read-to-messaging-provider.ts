import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794505411073)
export class AddMarkThreadAsReadToMessagingProviderFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."messagingProvider" ADD "markThreadAsReadLogicFunctionUniversalIdentifier" uuid',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."messagingProvider" DROP COLUMN "markThreadAsReadLogicFunctionUniversalIdentifier"',
    );
  }
}
