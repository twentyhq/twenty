import { isArray, isString } from '@sniptt/guards';
import semver from 'semver';
import {
  type Manifest,
  type RequiredApplicationManifest,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { compareByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-universal-identifier.util';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

const buildForeignApplicationIdByUniversalIdentifier = ({
  allFlatEntityMaps,
  flatApplication,
}: {
  allFlatEntityMaps: AllFlatEntityMaps;
  flatApplication: Pick<FlatApplication, 'id'>;
}): Map<string, string> => {
  const applicationIdByUniversalIdentifier = new Map<string, string>();

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    for (const flatEntity of Object.values(
      allFlatEntityMaps[getMetadataFlatEntityMapsKey(metadataName)]
        .byUniversalIdentifier,
    )) {
      if (
        isDefined(flatEntity) &&
        flatEntity.applicationId !== flatApplication.id
      ) {
        applicationIdByUniversalIdentifier.set(
          flatEntity.universalIdentifier,
          flatEntity.applicationId,
        );
      }
    }
  }

  return applicationIdByUniversalIdentifier;
};

const collectReferencedApplicationIds = ({
  value,
  applicationIdByUniversalIdentifier,
  referencedApplicationIds,
}: {
  value: unknown;
  applicationIdByUniversalIdentifier: Map<string, string>;
  referencedApplicationIds: Set<string>;
}): void => {
  if (isString(value)) {
    const applicationId = applicationIdByUniversalIdentifier.get(value);

    if (isDefined(applicationId)) {
      referencedApplicationIds.add(applicationId);
    }

    return;
  }

  const children = isArray(value)
    ? value
    : isPlainObject(value)
      ? Object.values(value)
      : [];

  for (const child of children) {
    collectReferencedApplicationIds({
      value: child,
      applicationIdByUniversalIdentifier,
      referencedApplicationIds,
    });
  }
};

// Declared ranges win; applications only referenced by exported entities are added with a caret range on their installed version
export const deriveRequiredApplicationsFromManifest = ({
  manifest,
  flatApplication,
  flatApplicationMaps,
  allFlatEntityMaps,
}: {
  manifest: Omit<Manifest, 'application'>;
  flatApplication: Pick<FlatApplication, 'id' | 'requiredApplications'>;
  flatApplicationMaps: FlatApplicationCacheMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
}): RequiredApplicationManifest[] => {
  const referencedApplicationIds = new Set<string>();

  collectReferencedApplicationIds({
    value: manifest,
    applicationIdByUniversalIdentifier:
      buildForeignApplicationIdByUniversalIdentifier({
        allFlatEntityMaps,
        flatApplication,
      }),
    referencedApplicationIds,
  });

  const declaredUniversalIdentifiers = new Set(
    flatApplication.requiredApplications.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  );

  const referencedRequiredApplications = [...referencedApplicationIds]
    .map((applicationId) =>
      findActiveFlatApplicationById(flatApplicationMaps, applicationId),
    )
    .filter(isDefined)
    .filter(
      ({ universalIdentifier }) =>
        universalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
        !declaredUniversalIdentifiers.has(universalIdentifier),
    )
    .map(({ universalIdentifier, version }) => ({
      universalIdentifier,
      versionRange:
        isDefined(version) && isDefined(semver.valid(version))
          ? `^${version}`
          : '*',
    }))
    .sort(compareByUniversalIdentifier);

  return [
    ...flatApplication.requiredApplications,
    ...referencedRequiredApplications,
  ];
};
