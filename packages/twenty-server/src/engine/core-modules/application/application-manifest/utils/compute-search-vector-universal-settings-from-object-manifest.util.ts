import { type ObjectManifest } from 'twenty-shared/application';
import {
  type FieldMetadataUniversalSettings,
  FieldMetadataType,
} from 'twenty-shared/types';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { isSearchableFieldType } from 'src/engine/workspace-manager/utils/is-searchable-field.util';

export const computeSearchVectorUniversalSettingsFromObjectManifest = ({
  objectManifest,
}: {
  objectManifest: ObjectManifest;
}): FieldMetadataUniversalSettings<FieldMetadataType.TS_VECTOR> => {
  const labelIdentifierField = objectManifest.fields.find(
    (field) =>
      field.universalIdentifier ===
      objectManifest.labelIdentifierFieldMetadataUniversalIdentifier,
  );

  if (!labelIdentifierField) {
    throw new ApplicationException(
      `Label identifier field with universalIdentifier "${objectManifest.labelIdentifierFieldMetadataUniversalIdentifier}" not found in object "${objectManifest.nameSingular}"`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  if (!isSearchableFieldType(labelIdentifierField.type)) {
    throw new ApplicationException(
      `Label identifier field "${labelIdentifierField.name}" on object "${objectManifest.nameSingular}" has type "${labelIdentifierField.type}" which is not searchable`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return {
    asExpression: getTsVectorColumnExpressionFromFields([
      {
        name: labelIdentifierField.name,
        type: labelIdentifierField.type,
      },
    ]),
    generatedType: 'STORED',
  };
};
