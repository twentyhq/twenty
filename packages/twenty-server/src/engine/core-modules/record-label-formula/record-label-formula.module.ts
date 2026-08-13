import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { RecordLabelFormulaService } from 'src/engine/core-modules/record-label-formula/services/record-label-formula.service';
import { RecordLabelFormulaRelationService } from 'src/engine/core-modules/record-label-formula/services/record-label-formula-relation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [TypeORMModule, WorkspaceCacheModule],
  providers: [RecordLabelFormulaRelationService, RecordLabelFormulaService],
  exports: [RecordLabelFormulaService],
})
export class RecordLabelFormulaModule {}
