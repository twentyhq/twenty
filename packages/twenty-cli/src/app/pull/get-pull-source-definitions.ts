import {
  type FrontComponentManifest,
  type LogicFunctionManifest,
} from 'twenty-shared/application';

export const getPullSourceDefinitions = <
  TFrontComponent extends Pick<
    FrontComponentManifest,
    'sourceComponentPath' | 'sourceFiles'
  >,
  TLogicFunction extends Pick<
    LogicFunctionManifest,
    'sourceHandlerPath' | 'sourceFiles'
  >,
>(
  manifest: {
    frontComponents: TFrontComponent[];
    logicFunctions: TLogicFunction[];
  } | null,
) => [
  ...(manifest?.frontComponents ?? []).map((component) => ({
    kind: 'frontComponent' as const,
    entityKey: 'frontComponents' as const,
    label: 'Front component',
    sourcePath: component.sourceComponentPath,
    sourceFiles: component.sourceFiles,
    requiredSdkExports: ['defineFrontComponent'],
    definition: component,
  })),
  ...(manifest?.logicFunctions ?? []).map((logicFunction) => ({
    kind: 'logicFunction' as const,
    entityKey: 'logicFunctions' as const,
    label: 'Logic function',
    sourcePath: logicFunction.sourceHandlerPath,
    sourceFiles: logicFunction.sourceFiles,
    requiredSdkExports: ['defineLogicFunction'],
    definition: logicFunction,
  })),
];
