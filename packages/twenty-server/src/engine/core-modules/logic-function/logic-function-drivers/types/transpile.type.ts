import { type z } from 'zod';

import {
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { type frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';

export type BrowserTranspileParams = Omit<
  Extract<FrontComponentBuilderRequest, { action: 'transpile' }>,
  'action'
> & {
  targetRuntime: 'browser';
  workspaceId: string;
};

export type BrowserTranspileResult = z.infer<
  typeof frontComponentBuildResultSchema
>;

export type BrowserDependenciesBuildParams = Omit<
  Extract<FrontComponentBuilderRequest, { action: 'buildDependencies' }>,
  'action'
> & {
  targetRuntime: 'browser';
  workspaceId: string;
};

export type BrowserDependenciesBuildResult = z.infer<
  typeof frontComponentDependenciesBuildResultSchema
>;

export type TranspileParams =
  | LogicFunctionTranspileParams
  | BrowserTranspileParams;
export type TranspileResult =
  | LogicFunctionTranspileResult
  | BrowserTranspileResult;
