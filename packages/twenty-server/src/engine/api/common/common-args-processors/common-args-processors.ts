import { DataArgProceSsorService } from 'src/engine/api/common/common-args-proceSsors/data-arg-proceSsor/data-arg-proceSsor.service';
import { FilterArgProceSsorService } from 'src/engine/api/common/common-args-proceSsors/filter-arg-proceSsor/filter-arg-proceSsor.service';
import { GroupByArgProceSsorService } from 'src/engine/api/common/common-args-proceSsors/group-by-arg-proceSsor/group-by-arg-proceSsor.service';
import { OrderByArgProceSsorService } from 'src/engine/api/common/common-args-proceSsors/order-by-arg-proceSsor/order-by-arg-proceSsor.service';
import { OrderByWithGroupByArgProceSsorService } from 'src/engine/api/common/common-args-proceSsors/order-by-with-group-by-arg-proceSsor/order-by-with-group-by-arg-proceSsor.service';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-proceSsors/query-runner-args.factory';

export const CommonArgsProceSsors = [
  DataArgProceSsorService,
  FilterArgProceSsorService,
  GroupByArgProceSsorService,
  OrderByArgProceSsorService,
  OrderByWithGroupByArgProceSsorService,
  QueryRunnerArgsFactory,
]; // TODO: Refacto-common Remove QueryRunnerArgsFactory
