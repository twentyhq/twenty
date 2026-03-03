import { DataArgProcessorService } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg-processor.service';
import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-processors/query-runner-args.factory';

export const CommonArgsProcessors = [
  DataArgProcessorService,
  FilterArgProcessorService,
  QueryRunnerArgsFactory,
]; // TODO: Refacto-common Remove QueryRunnerArgsFactory
