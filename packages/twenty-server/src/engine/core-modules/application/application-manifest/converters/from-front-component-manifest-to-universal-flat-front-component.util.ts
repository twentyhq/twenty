import { type FrontComponentManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

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
  const settingsTab = frontComponentManifest.settingsTab ?? null;

  return {
    universalIdentifier: frontComponentManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: frontComponentManifest.name ?? frontComponentManifest.componentName,
    description: frontComponentManifest.description ?? null,
    sourceComponentPath: frontComponentManifest.sourceComponentPath,
    builtComponentPath: frontComponentManifest.builtComponentPath,
    componentName: frontComponentManifest.componentName,
    builtComponentChecksum: frontComponentManifest.builtComponentChecksum,
    // A settings front component always renders visible UI.
    isHeadless: isDefined(settingsTab)
      ? false
      : (frontComponentManifest.isHeadless ?? false),
    usesSdkClient: frontComponentManifest.usesSdkClient ?? false,
    settingsTab,
    createdAt: now,
    updatedAt: now,
  };
};
