import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationSourceResource } from 'src/engine/core-modules/application/application-manifest/types/application-source-resource.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

export const getApplicationSourceResources = ({
  manifest,
  flatLogicFunctionMaps,
}: {
  manifest: Partial<Pick<Manifest, 'frontComponents' | 'logicFunctions'>>;
  flatLogicFunctionMaps?: AllFlatEntityMaps['flatLogicFunctionMaps'];
}): ApplicationSourceResource[] => [
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
  ...(manifest.logicFunctions ?? []).map(({ sourceFiles, ...definition }) => {
    const logicFunction = isDefined(flatLogicFunctionMaps)
      ? findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatLogicFunctionMaps,
          universalIdentifier: definition.universalIdentifier,
        })
      : undefined;
    return {
      kind: 'logicFunction' as const,
      universalIdentifier: definition.universalIdentifier,
      sourcePath: definition.sourceHandlerPath,
      inventoryPath: `logic-function-sources/${definition.universalIdentifier}.json`,
      sourceFiles:
        isDefined(flatLogicFunctionMaps) && !isDefined(logicFunction)
          ? undefined
          : sourceFiles,
      metadata: { updatedAt: logicFunction?.updatedAt },
    };
  }),
];
