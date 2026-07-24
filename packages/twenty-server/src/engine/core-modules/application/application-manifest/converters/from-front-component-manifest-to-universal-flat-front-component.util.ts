import { type FrontComponentManifest } from 'twenty-shared/application';

import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';

export const fromFrontComponentManifestToUniversalFlatFrontComponent = ({
  frontComponentManifest,
  applicationUniversalIdentifier,
  isSettingsTabFrontComponent,
  now,
}: {
  frontComponentManifest: FrontComponentManifest;
  applicationUniversalIdentifier: string;
  isSettingsTabFrontComponent: boolean;
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
    // A settings tab front component always renders visible UI.
    isHeadless: isSettingsTabFrontComponent
      ? false
      : (frontComponentManifest.isHeadless ?? false),
    usesSdkClient: frontComponentManifest.usesSdkClient ?? false,
    createdAt: now,
    updatedAt: now,
  };
};
