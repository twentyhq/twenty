import { DataArgHandler } from 'src/engine/api/common/common-args-handlers/data-arg-handler/data-arg.handler';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-handlers/query-runner-args.factory';

export const CommonArgsHandlers = [DataArgHandler, QueryRunnerArgsFactory]; // TODO: Refacto-common Remove QueryRunnerArgsFactory
