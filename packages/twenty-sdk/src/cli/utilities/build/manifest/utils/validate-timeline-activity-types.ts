import { isNonEmptyString } from '@sniptt/guards';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import { type Manifest } from 'twenty-shared/application';
import { RelationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  getDuplicateValues,
  MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION,
  isRelationFieldManifest,
} from '@/cli/utilities/build/manifest/utils/manifest-validation-helpers';

const isValidUniversalIdentifier = (universalIdentifier: string): boolean =>
  uuidValidate(universalIdentifier) &&
  uuidVersion(universalIdentifier) >= MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION;

export const validateTimelineActivityTypes = (
  manifest: Pick<
    Manifest,
    'fields' | 'frontComponents' | 'objects' | 'timelineActivityTypes'
  >,
): string[] => {
  const errors: string[] = [];
  const duplicateNames = getDuplicateValues(
    manifest.timelineActivityTypes.map(
      (timelineActivityType) => timelineActivityType.name,
    ),
  );
  const frontComponentUniversalIdentifiers = new Set(
    manifest.frontComponents.map(
      (frontComponent) => frontComponent.universalIdentifier,
    ),
  );

  for (const duplicateName of duplicateNames) {
    errors.push(
      `Timeline activity type name "${duplicateName}" is used more than once. Names must be unique within an application.`,
    );
  }

  for (const timelineActivityType of manifest.timelineActivityTypes) {
    if (
      isDefined(timelineActivityType.frontComponentUniversalIdentifier) &&
      !frontComponentUniversalIdentifiers.has(
        timelineActivityType.frontComponentUniversalIdentifier,
      )
    ) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" references front component "${timelineActivityType.frontComponentUniversalIdentifier}", which is not defined by this application.`,
      );
    }

    const emit = timelineActivityType.emit;
    const replacementUniversalIdentifier =
      timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier;

    if (!isDefined(emit)) {
      if (isDefined(replacementUniversalIdentifier)) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" declares replacesTimelineActivityTypeUniversalIdentifier without an automatic emit contract.`,
        );
      }

      continue;
    }

    const through = emit.through;
    const triggerFieldUniversalIdentifiers =
      through?.triggerFieldUniversalIdentifiers;
    const hasValidObjectUniversalIdentifier = isValidUniversalIdentifier(
      emit.objectUniversalIdentifier,
    );

    if (!hasValidObjectUniversalIdentifier) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" references an invalid object universal identifier "${emit.objectUniversalIdentifier}".`,
      );
    }

    if (
      (emit.on === 'linked' || emit.on === 'unlinked') &&
      !isDefined(through)
    ) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" must declare emit.through for a ${emit.on} event.`,
      );
    }

    if (isDefined(triggerFieldUniversalIdentifiers)) {
      if (
        emit.on !== 'updated' ||
        !isNonEmptyArray(triggerFieldUniversalIdentifiers) ||
        new Set(triggerFieldUniversalIdentifiers).size !==
          triggerFieldUniversalIdentifiers.length
      ) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" trigger fields must be a non-empty list of unique fields on an updated through event.`,
        );
      }
    }

    const sourceObject = hasValidObjectUniversalIdentifier
      ? manifest.objects.find(
          (object) =>
            object.universalIdentifier === emit.objectUniversalIdentifier,
        )
      : undefined;

    if (!isDefined(sourceObject)) {
      if (
        hasValidObjectUniversalIdentifier &&
        !isDefined(replacementUniversalIdentifier)
      ) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" targets object "${emit.objectUniversalIdentifier}", which is not defined by this application. Types targeting another application's object must declare replacesTimelineActivityTypeUniversalIdentifier.`,
        );
      }

      if (
        isDefined(replacementUniversalIdentifier) &&
        !isValidUniversalIdentifier(replacementUniversalIdentifier)
      ) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" references an invalid replacement universal identifier "${replacementUniversalIdentifier}".`,
        );
      }

      if (
        isDefined(through) &&
        !isValidUniversalIdentifier(through.relationFieldUniversalIdentifier)
      ) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" references an invalid through relation field universal identifier "${through.relationFieldUniversalIdentifier}".`,
        );
      }

      const invalidTriggerFieldUniversalIdentifiers =
        triggerFieldUniversalIdentifiers?.filter(
          (universalIdentifier) =>
            !isValidUniversalIdentifier(universalIdentifier),
        ) ?? [];

      if (invalidTriggerFieldUniversalIdentifiers.length > 0) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" references invalid trigger field universal identifiers: ${invalidTriggerFieldUniversalIdentifiers.join(', ')}.`,
        );
      }

      continue;
    }

    if (isDefined(replacementUniversalIdentifier)) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" targets an object defined by this application and must not replace another application's type.`,
      );
    }

    const sourceFields = [
      ...sourceObject.fields,
      ...manifest.fields.filter(
        (field) =>
          field.objectUniversalIdentifier === sourceObject.universalIdentifier,
      ),
    ];

    if (!isDefined(through)) {
      continue;
    }

    const relationField = sourceFields.find(
      (field) =>
        field.universalIdentifier === through.relationFieldUniversalIdentifier,
    );

    if (!isDefined(relationField)) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" references relation field "${through.relationFieldUniversalIdentifier}", which is not defined on object "${sourceObject.nameSingular}".`,
      );
    } else {
      const hasSupportedRelationShape =
        isRelationFieldManifest(relationField) &&
        isDefined(relationField.universalSettings) &&
        (relationField.universalSettings.relationType ===
          RelationType.MANY_TO_ONE ||
          (relationField.universalSettings.relationType ===
            RelationType.ONE_TO_MANY &&
            isNonEmptyString(
              relationField.universalSettings
                .junctionTargetFieldUniversalIdentifier,
            )));

      if (!hasSupportedRelationShape) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" must route through a MANY_TO_ONE relation or a junction-backed ONE_TO_MANY relation.`,
        );
      }
    }

    if (isDefined(triggerFieldUniversalIdentifiers)) {
      const sourceFieldUniversalIdentifiers = new Set(
        sourceFields.map((field) => field.universalIdentifier),
      );
      const missingTriggerFieldUniversalIdentifiers =
        triggerFieldUniversalIdentifiers.filter(
          (universalIdentifier) =>
            !sourceFieldUniversalIdentifiers.has(universalIdentifier),
        );

      if (missingTriggerFieldUniversalIdentifiers.length > 0) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" references trigger fields that are not defined on object "${sourceObject.nameSingular}": ${missingTriggerFieldUniversalIdentifiers.join(', ')}.`,
        );
      }
    }
  }

  return errors;
};
