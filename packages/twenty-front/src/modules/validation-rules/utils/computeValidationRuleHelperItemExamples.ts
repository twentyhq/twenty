import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';

const TEXT_TYPES = [FieldMetadataType.TEXT];
const NUMBER_TYPES = [FieldMetadataType.NUMBER, FieldMetadataType.NUMERIC];
const DATE_TYPES = [FieldMetadataType.DATE, FieldMetadataType.DATE_TIME];
const LIST_TYPES = [FieldMetadataType.MULTI_SELECT, FieldMetadataType.ARRAY];

const findField = (
  fields: ValidationRuleEditorField[],
  predicate: (field: ValidationRuleEditorField) => boolean,
) => fields.find((field) => !field.isSystem && predicate(field));

const findFieldOfTypes = (
  fields: ValidationRuleEditorField[],
  types: FieldMetadataType[],
) => findField(fields, (field) => types.includes(field.type));

const quote = (value: string) => JSON.stringify(value);

const computeFieldExamples = ({
  field,
  fields,
}: {
  field: ValidationRuleEditorField;
  fields: ValidationRuleEditorField[];
}): string[] => {
  const { path, type, selectOptionValues } = field;
  const [firstOption, secondOption] = selectOptionValues;

  if (TEXT_TYPES.includes(type)) {
    return [`isNonEmptyString(${path})`, doNotTranslate(`${path} != "N/A"`)];
  }

  if (NUMBER_TYPES.includes(type)) {
    return [
      `${path} > 0`,
      doNotTranslate(`not isDefined(${path}) or ${path} <= 1000`),
    ];
  }

  if (DATE_TYPES.includes(type)) {
    return [doNotTranslate(`${path} >= now`), `isDefined(${path})`];
  }

  if (type === FieldMetadataType.BOOLEAN) {
    return [doNotTranslate(`${path} == true`)];
  }

  if (type === FieldMetadataType.SELECT && isDefined(firstOption)) {
    return [
      `${path} == ${quote(firstOption)}`,
      doNotTranslate(
        `${path} in [${[firstOption, secondOption].filter(isDefined).map(quote).join(', ')}]`,
      ),
    ];
  }

  if (LIST_TYPES.includes(type)) {
    return [
      ...(isDefined(firstOption)
        ? [doNotTranslate(`includes(${path}, ${quote(firstOption)})`)]
        : []),
      doNotTranslate(`arrayLength(${path}) > 0`),
    ];
  }

  if (type === FieldMetadataType.RELATION) {
    const member = findField(
      fields,
      (candidate) =>
        candidate.path.startsWith(`${path}.`) &&
        [...TEXT_TYPES, ...NUMBER_TYPES].includes(candidate.type),
    );

    return [
      `isDefined(${path})`,
      ...(isDefined(member)
        ? [
            doNotTranslate(
              `not isDefined(${path}) or isDefined(${member.path})`,
            ),
          ]
        : []),
    ];
  }

  if (field.hasMembers) {
    const member = findField(
      fields,
      (candidate) =>
        candidate.path.startsWith(`${path}.`) &&
        TEXT_TYPES.includes(candidate.type),
    );

    return [
      doNotTranslate(`not isEmpty(${path})`),
      ...(isDefined(member) ? [`isNonEmptyString(${member.path})`] : []),
    ];
  }

  return [`isDefined(${path})`];
};

const computeFunctionExamples = ({
  name,
  fields,
}: {
  name: string;
  fields: ValidationRuleEditorField[];
}): string[] => {
  const rootFields = fields.filter((field) => !field.path.includes('.'));

  switch (name) {
    case 'isDefined': {
      const field =
        findFieldOfTypes(rootFields, [
          ...DATE_TYPES,
          FieldMetadataType.RELATION,
        ]) ?? findField(rootFields, () => true);

      return isDefined(field) ? [`isDefined(${field.path})`] : [];
    }
    case 'isEmpty': {
      const field =
        findField(rootFields, (candidate) => candidate.hasMembers) ??
        findField(rootFields, () => true);

      return isDefined(field)
        ? [doNotTranslate(`not isEmpty(${field.path})`)]
        : [];
    }
    case 'isNonEmptyString': {
      const field = findFieldOfTypes(fields, TEXT_TYPES);

      return isDefined(field) ? [`isNonEmptyString(${field.path})`] : [];
    }
    case 'includes': {
      const listField = findField(
        rootFields,
        (candidate) =>
          LIST_TYPES.includes(candidate.type) &&
          candidate.selectOptionValues.length > 0,
      );
      const [firstOption] = listField?.selectOptionValues ?? [];
      const textField = findFieldOfTypes(fields, TEXT_TYPES);

      return [
        ...(isDefined(listField) && isDefined(firstOption)
          ? [
              doNotTranslate(
                `includes(${listField.path}, ${quote(firstOption)})`,
              ),
            ]
          : []),
        ...(isDefined(textField)
          ? [doNotTranslate(`not includes(${textField.path}, "test")`)]
          : []),
      ];
    }
    case 'arrayLength': {
      const field = findFieldOfTypes(rootFields, LIST_TYPES);

      return isDefined(field)
        ? [doNotTranslate(`arrayLength(${field.path}) > 0`)]
        : [];
    }
    default:
      return [];
  }
};

const computeKeywordExamples = ({
  name,
  fields,
}: {
  name: string;
  fields: ValidationRuleEditorField[];
}): string[] => {
  const rootFields = fields.filter(
    (field) => !field.path.includes('.') && !field.isSystem,
  );
  const [firstField, secondField] = rootFields;

  switch (name) {
    case 'and':
    case 'or':
      return isDefined(firstField) && isDefined(secondField)
        ? [
            doNotTranslate(
              `isDefined(${firstField.path}) ${name} isDefined(${secondField.path})`,
            ),
          ]
        : [];
    case 'not':
      return isDefined(firstField)
        ? [doNotTranslate(`not isEmpty(${firstField.path})`)]
        : [];
    case 'in': {
      const field = findField(
        rootFields,
        (candidate) =>
          candidate.type === FieldMetadataType.SELECT &&
          candidate.selectOptionValues.length > 0,
      );

      return isDefined(field)
        ? [
            doNotTranslate(
              `${field.path} in [${field.selectOptionValues.slice(0, 2).map(quote).join(', ')}]`,
            ),
          ]
        : [];
    }
    case 'now': {
      const field = findFieldOfTypes(rootFields, DATE_TYPES);

      return isDefined(field) ? [doNotTranslate(`${field.path} >= now`)] : [];
    }
    case 'true':
    case 'false': {
      const field = findFieldOfTypes(rootFields, [FieldMetadataType.BOOLEAN]);

      return isDefined(field) ? [`${field.path} == ${name}`] : [];
    }
    default:
      return [];
  }
};

export const computeValidationRuleHelperItemExamples = ({
  item,
  fields,
}: {
  item: ValidationRuleHelperItem;
  fields: ValidationRuleEditorField[];
}): string[] => {
  switch (item.kind) {
    case 'field':
      return computeFieldExamples({ field: item.field, fields });
    case 'function':
      return computeFunctionExamples({ name: item.definition.name, fields });
    case 'keyword':
      return computeKeywordExamples({ name: item.definition.name, fields });
  }
};
