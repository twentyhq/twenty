import { DataArgProcessor } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg.processor';
import { QueryRunnerArgsFactory } from 'src/engine/api/common/common-args-processors/query-runner-args.factory';

export const CommonArgsProcessors = [DataArgProcessor, QueryRunnerArgsFactory]; // TODO: Refacto-common Remove QueryRunnerArgsFactory
