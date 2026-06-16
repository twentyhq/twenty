import { Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { QueryRecordsService } from 'src/engine/core-modules/record-query-language/services/query-records.service';
import { QueryToolProvider } from 'src/engine/core-modules/record-query-language/tools/query-tool.provider';

// Self-contained module for the `query` AI tool: it compiles a tagged query AST
// into Common API filters and executes it through the record-crud services.
// ToolProviderModule imports this module to register the provider and to let the
// tool executor dispatch QueryRecordsService.
@Module({
  imports: [RecordCrudModule],
  providers: [QueryRecordsService, QueryToolProvider],
  exports: [QueryRecordsService, QueryToolProvider],
})
export class RecordQueryLanguageModule {}
