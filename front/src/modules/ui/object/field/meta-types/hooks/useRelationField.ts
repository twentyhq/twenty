import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '../../contexts/FieldContext';
import { useFieldInitialValue } from '../../hooks/useFieldInitialValue';
import { entityFieldsFamilySelector } from '../../states/selectors/entityFieldsFamilySelector';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldRelation } from '../../types/guards/isFieldRelation';

// TODO: we will be able to type more precisely when we will have custom field and custom entities support
export const useRelationField = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata('RELATION', isFieldRelation, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<any | null>(
    entityFieldsFamilySelector({
      entityId: entityId,
      fieldName: fieldName,
    }),
  );

  const fieldInitialValue = useFieldInitialValue();

  const initialSearchValue = fieldInitialValue?.isEmpty
    ? null
    : fieldInitialValue?.value;

  const initialValue = fieldInitialValue?.isEmpty ? null : fieldValue;

  const mapToObjectIdentifiers = (record: any) => {
    let name = '';
    for (const fieldPath of fieldDefinition.metadata
      .labelIdentifierFieldPaths) {
      const fieldPathParts = fieldPath.split('.');

      if (fieldPathParts.length === 1) {
        name += record[fieldPathParts[0]];
      } else if (fieldPathParts.length === 2) {
        name += record[fieldPathParts[0]][fieldPathParts[1]] + ' ';
      } else {
        throw new Error(
          `Invalid field path ${fieldPath}. Relation picker only supports field paths with 1 or 2 parts.`,
        );
      }
    }

    const avatarUrl = record[fieldDefinition.metadata.imageIdentifierUrlField];
    return {
      id: record.id,
      name: name.trimEnd(),
      avatarUrl: avatarUrl
        ? fieldDefinition.metadata.imageIdentifierUrlPrefix +
          record[fieldDefinition.metadata.imageIdentifierUrlField]
        : '',
      avatarType: fieldDefinition.metadata.imageIdentifierFormat,
      record: record,
    };
  };

  return {
    fieldDefinition,
    fieldValue,
    initialValue,
    initialSearchValue,
    setFieldValue,
    mapToObjectIdentifiers,
  };
};
