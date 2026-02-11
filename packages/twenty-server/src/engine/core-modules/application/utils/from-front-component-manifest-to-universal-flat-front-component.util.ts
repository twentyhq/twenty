import { type FrontComponentManifest } from 'twenty-shared/application';

import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';

export const fromFrontComponentManifestToUniversalFlatFrontComponent = ({
  frontComponentManifest,
  applicationUniversalIdentifier,
  now,
}: {
  frontComponentManifest: FrontComponentManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatFrontComponent => {
  return {
    universalIdentifier: frontComponentManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: frontComponentManifest.name ?? frontComponentManifest.componentName,
    description: frontComponentManifest.description ?? null,
    sourceComponentPath: frontComponentManifest.sourceComponentPath,
    builtComponentPath: frontComponentManifest.builtComponentPath,
    componentName: frontComponentManifest.componentName,
    builtComponentChecksum: frontComponentManifest.builtComponentChecksum,
    createdAt: now,
    updatedAt: now,
  };
};
