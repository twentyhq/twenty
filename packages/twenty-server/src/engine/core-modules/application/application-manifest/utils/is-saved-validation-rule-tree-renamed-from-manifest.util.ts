/* @license Enterprise */

import { isString } from '@sniptt/guards';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from 'twenty-shared/constants';
import {
  type ExpressionFieldNode,
  type ExpressionNode,
  expressionNodeSchema,
} from 'twenty-shared/expression';
import {
  isDefined,
  isPlainObject,
  parseExpressionNode,
} from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type SavedPathSegment = { name: string } | { fieldUniversalIdentifier: string };

type IsRenamedFieldPath = (params: {
  path: string;
  fieldNode: ExpressionFieldNode;
}) => boolean;

const isSameTreeUpToRenamedFields = ({
  manifestValue,
  savedValue,
  isRenamedFieldPath,
}: {
  manifestValue: unknown;
  savedValue: unknown;
  isRenamedFieldPath: IsRenamedFieldPath;
}): boolean => {
  if (Array.isArray(manifestValue) && Array.isArray(savedValue)) {
    return (
      manifestValue.length === savedValue.length &&
      manifestValue.every((manifestItem, index) =>
        isSameTreeUpToRenamedFields({
          manifestValue: manifestItem,
          savedValue: savedValue[index],
          isRenamedFieldPath,
        }),
      )
    );
  }

  if (!isPlainObject(manifestValue) || !isPlainObject(savedValue)) {
    return manifestValue === savedValue;
  }

  if (
    manifestValue.type === 'VARIABLE' &&
    isString(manifestValue.path) &&
    savedValue.type === 'FIELD'
  ) {
    const savedFieldNode = expressionNodeSchema.safeParse(savedValue);

    return (
      savedFieldNode.success &&
      savedFieldNode.data.type === 'FIELD' &&
      isRenamedFieldPath({
        path: manifestValue.path,
        fieldNode: savedFieldNode.data,
      })
    );
  }

  const keys = new Set([
    ...Object.keys(manifestValue),
    ...Object.keys(savedValue),
  ]);

  return [...keys].every((key) =>
    isSameTreeUpToRenamedFields({
      manifestValue: manifestValue[key],
      savedValue: savedValue[key],
      isRenamedFieldPath,
    }),
  );
};

// A workspace can rename a field outside the app, so the manifest may still name it by its old name.
// The app names its own fields in the manifest, so those must keep their saved names.
export const isSavedValidationRuleTreeRenamedFromManifest = ({
  manifestExpression,
  savedTree,
  ownerFlatApplication,
  existingAllFlatEntityMaps,
}: {
  manifestExpression: string;
  savedTree: ExpressionNode;
  ownerFlatApplication: Pick<FlatApplication, 'id'>;
  existingAllFlatEntityMaps: Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;
}): boolean => {
  const manifestParsing = parseExpressionNode(manifestExpression);

  const isRenamedFieldPath: IsRenamedFieldPath = ({
    path,
    fieldNode: {
      fieldUniversalIdentifier,
      relationFieldUniversalIdentifier,
      subFieldName,
      isPreviousValue,
    },
  }) => {
    const segments = path.split('.');
    const savedSegments: SavedPathSegment[] = [
      isPreviousValue === true
        ? { name: VALIDATION_RULE_PREVIOUS_VARIABLE_NAME }
        : undefined,
      isDefined(relationFieldUniversalIdentifier)
        ? { fieldUniversalIdentifier: relationFieldUniversalIdentifier }
        : undefined,
      { fieldUniversalIdentifier },
      isDefined(subFieldName) ? { name: subFieldName } : undefined,
    ].filter(isDefined);

    return (
      segments.length === savedSegments.length &&
      savedSegments.every((savedSegment, index) => {
        if (!('fieldUniversalIdentifier' in savedSegment)) {
          return savedSegment.name === segments[index];
        }

        const existingField =
          existingAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            savedSegment.fieldUniversalIdentifier
          ];

        // A deleted field has no name left to compare
        return (
          !isDefined(existingField) ||
          existingField.applicationId !== ownerFlatApplication.id ||
          existingField.name === segments[index]
        );
      })
    );
  };

  return (
    manifestParsing.isValid &&
    isSameTreeUpToRenamedFields({
      manifestValue: manifestParsing.node,
      savedValue: savedTree,
      isRenamedFieldPath,
    })
  );
};
