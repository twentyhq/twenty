import { DataArgProcessor } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg.processor';
import { FilesFieldSyncService } from 'src/engine/api/common/common-args-processors/data-arg-processor/services/files-field-sync.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-processors/query-runner-args.factory';

export const CommonArgsProcessors = [
  DataArgProcessor,
  FilesFieldSyncService,
  QueryRunnerArgsFactory,
]; // TODO: Refacto-common Remove QueryRunnerArgsFactory
