import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// 2.21 is workspace-only (no core schema change), so nothing advances the
// instance-inferred version past 2.20 while workspaces reach 2.21 — which would
// make apps requiring >=2.21.0 fail the upload-time server gate forever. This
// no-op command records that the instance has reached 2.21.
@RegisteredInstanceCommand('2.21.0', 1783929909000)
export class SetInstanceVersionTo2_21FastInstanceCommand
  implements FastInstanceCommand
{
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
