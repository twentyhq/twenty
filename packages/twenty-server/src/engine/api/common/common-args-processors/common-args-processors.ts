import { DataArgProcessorService } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg-processor.service';
import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { GroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/group-by-arg-processor.service';
import { OrderByArgProcessorService } from 'src/engine/api/common/common-args-processors/order-by-arg-processor/order-by-arg-processor.service';
import { OrderByWithGroupByArgProcessorService } from 'src/engine/api/common/common-args-processors/order-by-with-group-by-arg-processor/order-by-with-group-by-arg-processor.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-processors/query-runner-args.factory';

export const CommonArgsProcessors = [
  DataArgProcessorService,
  FilterArgProcessorService,
  GroupByArgProcessorService,
  OrderByArgProcessorService,
  OrderByWithGroupByArgProcessorService,
  QueryRunnerArgsFactory,
]; // TODO: Refacto-common Remove QueryRunnerArgsFactory
