import { isString } from '@sniptt/guards';
import { type FieldManifest } from 'twenty-shared/application';
import { QUOTED_STRING_REGEX } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  getUnsupportedRelationFieldReason,
  isExportableRelationFlatFieldMetadata,
} from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-relation-field-reason.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  type FlatFieldMetadataOptionMapsForOptions,
  resolveFlatFieldMetadataOptions,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const EMPTY_ACTOR_DEFAULT_VALUE = {
  source: null,
  name: null,
  workspaceMemberId: null,
  context: null,
};

const isDefaultValueInOptionValues = ({
  defaultValue,
  optionValues,
}: {
  defaultValue: unknown;
  optionValues: Set<string>;
}) =>
  isString(defaultValue) &&
  optionValues.has(defaultValue.replace(QUOTED_STRING_REGEX, '$1'));

const buildDefaultValue = ({
  flatFieldMetadata,
  options,
}: {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  options: ReturnType<typeof resolveFlatFieldMetadataOptions>;
}) => {
  const { type, defaultValue } = flatFieldMetadata;

  if (type === FieldMetadataType.ACTOR && !isDefined(defaultValue)) {
    return EMPTY_ACTOR_DEFAULT_VALUE;
  }

  if (
    !isDefined(defaultValue) ||
    (type !== FieldMetadataType.SELECT &&
      type !== FieldMetadataType.MULTI_SELECT)
  ) {
    return defaultValue;
  }

  // Only the app's own option rows are exported, so a default may point at a workspace-added option.
  const optionValues = new Set((options ?? []).map(({ value }) => value));

  if (type === FieldMetadataType.SELECT) {
    return isDefaultValueInOptionValues({ defaultValue, optionValues })
      ? defaultValue
      : null;
  }

  const exportedDefaultValues = Array.isArray(defaultValue)
    ? defaultValue.filter((value) =>
        isDefaultValueInOptionValues({ defaultValue: value, optionValues }),
      )
    : [];

  return isNonEmptyArray(exportedDefaultValues) ? exportedDefaultValues : null;
};

const buildRelationProperties = (
  flatFieldMetadata: UniversalFlatFieldMetadata,
) => {
  if (!isExportableRelationFlatFieldMetadata(flatFieldMetadata)) {
    throw new ApplicationException(
      `Relation field "${flatFieldMetadata.name}" cannot be exported: ${getUnsupportedRelationFieldReason(flatFieldMetadata)}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return {
    relationTargetFieldMetadataUniversalIdentifier:
      flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier:
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    universalSettings: flatFieldMetadata.universalSettings,
    ...(flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION
      ? { morphId: flatFieldMetadata.morphId }
      : {}),
  };
};

export const fromFlatFieldMetadataToFieldManifest = ({
  flatFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FieldManifest => {
  const options = resolveFlatFieldMetadataOptions({
    flatFieldMetadata,
    flatFieldMetadataOptionMaps,
  });

  const fieldManifest = {
    universalIdentifier: flatFieldMetadata.universalIdentifier,
    type: flatFieldMetadata.type,
    name: flatFieldMetadata.name,
    label: flatFieldMetadata.label,
    ...(isDefined(flatFieldMetadata.description)
      ? { description: flatFieldMetadata.description }
      : {}),
    ...(isDefined(flatFieldMetadata.icon)
      ? { icon: flatFieldMetadata.icon }
      : {}),
    options,
    defaultValue: buildDefaultValue({ flatFieldMetadata, options }),
    isUIEditable: flatFieldMetadata.isUIEditable,
    ...(isDefined(flatFieldMetadata.disabledFieldPermissionActions)
      ? {
          disabledFieldPermissionActions:
            flatFieldMetadata.disabledFieldPermissionActions,
        }
      : {}),
    isNullable: flatFieldMetadata.isNullable,
    isUnique: flatFieldMetadata.isUnique ?? false,
    isSearchable: flatFieldMetadata.isSearchable,
    isAuditLogged: flatFieldMetadata.isAuditLogged,
    isLabelSyncedWithName: flatFieldMetadata.isLabelSyncedWithName,
    objectUniversalIdentifier:
      flatFieldMetadata.objectMetadataUniversalIdentifier,
    ...(isMorphOrRelationFieldMetadataType(flatFieldMetadata.type)
      ? buildRelationProperties(flatFieldMetadata)
      : { universalSettings: flatFieldMetadata.universalSettings }),
  };

  return fieldManifest as FieldManifest;
};
