import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const CALL_RECORDING_NAME_SINGULAR = 'callRecording';
const CALL_RECORDING_NAME_PLURAL = 'callRecordings';
const CALL_RECORDING_OLD_NAME_SINGULAR = 'callRecordingOld';
const CALL_RECORDING_OLD_NAME_PLURAL = 'callRecordingsOld';
const MAX_OLD_NAME_ATTEMPTS = 100;

export const findCollidingCustomCallRecordingObjects = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): FlatObjectMetadata[] =>
  Object.values(flatObjectMetadataMaps.byUniversalIdentifier).filter(
    (flatObjectMetadata): flatObjectMetadata is FlatObjectMetadata =>
      isDefined(flatObjectMetadata) &&
      flatObjectMetadata.universalIdentifier !==
        STANDARD_OBJECTS.callRecording.universalIdentifier &&
      [flatObjectMetadata.nameSingular, flatObjectMetadata.namePlural].some(
        (name) =>
          name === CALL_RECORDING_NAME_SINGULAR ||
          name === CALL_RECORDING_NAME_PLURAL,
      ),
  );

export const resolveAvailableOldNames = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  additionalTakenNames: ReadonlySet<string> = new Set(),
): {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
} => {
  const takenNames = new Set([
    ...Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .flatMap((flatObjectMetadata) => [
        flatObjectMetadata.nameSingular,
        flatObjectMetadata.namePlural,
      ]),
    ...additionalTakenNames,
  ]);

  for (let attempt = 0; attempt < MAX_OLD_NAME_ATTEMPTS; attempt++) {
    const discriminator = attempt === 0 ? '' : `${attempt + 1}`;
    const nameSingular = `${CALL_RECORDING_OLD_NAME_SINGULAR}${discriminator}`;
    const namePlural = `${CALL_RECORDING_OLD_NAME_PLURAL}${discriminator}`;

    if (!takenNames.has(nameSingular) && !takenNames.has(namePlural)) {
      const labelSuffix = discriminator === '' ? '' : ` ${discriminator}`;

      return {
        nameSingular,
        namePlural,
        labelSingular: `Call Recording (Old)${labelSuffix}`,
        labelPlural: `Call Recordings (Old)${labelSuffix}`,
      };
    }
  }

  throw new Error(
    `Could not find an available callRecordingOld name after ${MAX_OLD_NAME_ATTEMPTS} attempts`,
  );
};
