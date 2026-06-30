import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// IndexMetadata is now the single source of truth for field-level
// uniqueness; the column on FieldMetadata is redundant and unread.
@RegisteredInstanceCommand('2.8.0', 1798300000000)
export class DropFieldMetadataIsUniqueColumnFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN IF EXISTS "isUnique"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata"
       ADD COLUMN IF NOT EXISTS "isUnique" boolean DEFAULT false`,
    );
  }
}
