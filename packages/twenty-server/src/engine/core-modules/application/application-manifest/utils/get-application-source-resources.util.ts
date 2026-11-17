import { type Manifest } from 'twenty-shared/application';

import { type ApplicationSourceResource } from 'src/engine/core-modules/application/application-manifest/types/application-source-resource.type';

export const getApplicationSourceResources = (
  manifest: Partial<Pick<Manifest, 'frontComponents' | 'logicFunctions'>>,
): ApplicationSourceResource[] => [
  ...(manifest.frontComponents ?? []).map((component) => ({
    kind: 'frontComponent' as const,
    universalIdentifier: component.universalIdentifier,
    sourcePath: component.sourceComponentPath,
    inventoryPath: `front-component-sources/${component.universalIdentifier}.json`,
    sourceFiles: component.sourceFiles,
    metadata: {
      sourceComponentPath: component.sourceComponentPath,
      builtComponentChecksum: component.builtComponentChecksum,
    },
  })),
  ...(manifest.logicFunctions ?? []).map(
    ({ sourceFiles, ...logicFunction }) => ({
      kind: 'logicFunction' as const,
      universalIdentifier: logicFunction.universalIdentifier,
      sourcePath: logicFunction.sourceHandlerPath,
      inventoryPath: `logic-function-sources/${logicFunction.universalIdentifier}.json`,
      sourceFiles,
      metadata: {
        sourceHandlerPath: logicFunction.sourceHandlerPath,
        builtHandlerChecksum: logicFunction.builtHandlerChecksum,
        definition: logicFunction,
      },
    }),
  ),
];
