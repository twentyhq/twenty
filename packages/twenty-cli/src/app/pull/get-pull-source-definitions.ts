import { type Manifest } from 'twenty-shared/application';

export const getPullSourceDefinitions = (
  manifest: Pick<Manifest, 'frontComponents' | 'logicFunctions'> | null,
) => [
  ...(manifest?.frontComponents ?? []).map((component) => ({
    kind: 'frontComponent' as const,
    entityKey: 'frontComponents' as const,
    label: 'Front component',
    sourcePath: component.sourceComponentPath,
    sourceFiles: component.sourceFiles,
    universalIdentifier: component.universalIdentifier,
    requiredSdkExports: ['defineFrontComponent'],
    definition: component,
  })),
  ...(manifest?.logicFunctions ?? []).map((logicFunction) => ({
    kind: 'logicFunction' as const,
    entityKey: 'logicFunctions' as const,
    label: 'Logic function',
    sourcePath: logicFunction.sourceHandlerPath,
    sourceFiles: logicFunction.sourceFiles,
    universalIdentifier: logicFunction.universalIdentifier,
    requiredSdkExports: ['defineLogicFunction'],
    definition: logicFunction,
  })),
];
