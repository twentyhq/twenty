import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const CALL_RECORDING_NAME_SINGULAR = 'callRecording';
const CALL_RECORDING_NAME_PLURAL = 'callRecordings';
const CALL_RECORDING_OLD_NAME_SINGULAR = 'callRecordingOld';
const CALL_RECORDING_OLD_NAME_PLURAL = 'callRecordingsOld';
const CALENDAR_EVENT_CALL_RECORDINGS_FIELD_NAME = 'callRecordings';
const FIELD_OLD_NAME_SUFFIX = 'Old';
const FIELD_OLD_LABEL_SUFFIX = ' (Old)';
const MAX_OLD_NAME_ATTEMPTS = 100;

const CALL_RECORDING_CALENDAR_EVENT_FIELD_NAMES = [
  CALENDAR_EVENT_CALL_RECORDINGS_FIELD_NAME,
];

const CALL_RECORDING_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIERS =
  new Set<string>([
    STANDARD_OBJECTS.calendarEvent.fields.callRecordings.universalIdentifier,
  ]);

export const findCallRecordingObjectNameCollisions = (
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

export const resolveAvailableOldCallRecordingObjectNames = (
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

export const buildCallRecordingObjectRenameUpdates = ({
  flatObjectMetadataMaps,
  now,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  now: string;
}): FlatObjectMetadata[] => {
  const reservedOldNames = new Set<string>();

  return findCallRecordingObjectNameCollisions(flatObjectMetadataMaps).map(
    (collidingObjectMetadata) => {
      const { nameSingular, namePlural, labelSingular, labelPlural } =
        resolveAvailableOldCallRecordingObjectNames(
          flatObjectMetadataMaps,
          reservedOldNames,
        );

      reservedOldNames.add(nameSingular);
      reservedOldNames.add(namePlural);

      return {
        ...collidingObjectMetadata,
        nameSingular,
        namePlural,
        labelSingular,
        labelPlural,
        isLabelSyncedWithName: false,
        updatedAt: now,
      };
    },
  );
};

export const findCalendarEventFieldNameCollisionsForCallRecording = (
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): FlatFieldMetadata[] =>
  Object.values(flatFieldMetadataMaps.byUniversalIdentifier).filter(
    (flatFieldMetadata): flatFieldMetadata is FlatFieldMetadata =>
      isDefined(flatFieldMetadata) &&
      flatFieldMetadata.objectMetadataUniversalIdentifier ===
        STANDARD_OBJECTS.calendarEvent.universalIdentifier &&
      !CALL_RECORDING_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIERS.has(
        flatFieldMetadata.universalIdentifier,
      ) &&
      CALL_RECORDING_CALENDAR_EVENT_FIELD_NAMES.includes(
        flatFieldMetadata.name,
      ),
  );

export const resolveAvailableOldCalendarEventFieldName = ({
  flatFieldMetadataMaps,
  originalFieldName,
  additionalTakenNames = new Set(),
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  originalFieldName: string;
  additionalTakenNames?: ReadonlySet<string>;
}): string => {
  const takenFieldNames = new Set([
    ...Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.objectMetadataUniversalIdentifier ===
          STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      )
      .map((flatFieldMetadata) => flatFieldMetadata.name),
    ...additionalTakenNames,
  ]);

  for (let attempt = 0; attempt < MAX_OLD_NAME_ATTEMPTS; attempt++) {
    const discriminator = attempt === 0 ? '' : `${attempt + 1}`;
    const candidateName = `${originalFieldName}${FIELD_OLD_NAME_SUFFIX}${discriminator}`;

    if (!takenFieldNames.has(candidateName)) {
      return candidateName;
    }
  }

  throw new Error(
    `Could not find an available ${originalFieldName}Old name after ${MAX_OLD_NAME_ATTEMPTS} attempts`,
  );
};

export const buildCalendarEventFieldRenameUpdates = ({
  flatFieldMetadataMaps,
  now,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  now: string;
}): FlatFieldMetadata[] => {
  const reservedOldFieldNames = new Set<string>();

  return findCalendarEventFieldNameCollisionsForCallRecording(
    flatFieldMetadataMaps,
  ).map((collidingFieldMetadata) => {
    const name = resolveAvailableOldCalendarEventFieldName({
      flatFieldMetadataMaps,
      originalFieldName: collidingFieldMetadata.name,
      additionalTakenNames: reservedOldFieldNames,
    });
    const oldNamePrefix = `${collidingFieldMetadata.name}${FIELD_OLD_NAME_SUFFIX}`;
    const discriminator = name.slice(oldNamePrefix.length);
    const labelSuffix =
      discriminator === ''
        ? FIELD_OLD_LABEL_SUFFIX
        : `${FIELD_OLD_LABEL_SUFFIX} ${discriminator}`;

    reservedOldFieldNames.add(name);

    return {
      ...collidingFieldMetadata,
      name,
      label: `${collidingFieldMetadata.label}${labelSuffix}`,
      isLabelSyncedWithName: false,
      updatedAt: now,
    };
  });
};
