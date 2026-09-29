import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';

export const buildValidationRulePreviewRelationGqlFields = ({
  bindingPaths,
  fields,
}: {
  bindingPaths: string[];
  fields: ValidationRuleFieldDescriptor[];
}): RecordGqlFields =>
  bindingPaths.reduce<RecordGqlFields>((relationGqlFields, bindingPath) => {
    const [relationFieldName, targetFieldName] = bindingPath.split('.');
    const relationField = fields.find(
      (field) =>
        field.name === relationFieldName &&
        isDefined(field.relationTargetFields),
    );

    if (!isDefined(relationField) || !isDefined(relationFieldName)) {
      return relationGqlFields;
    }

    const existingGqlFields = relationGqlFields[relationFieldName];

    return {
      ...relationGqlFields,
      [relationFieldName]: {
        ...(typeof existingGqlFields === 'object' ? existingGqlFields : {}),
        id: true,
        ...(isDefined(targetFieldName)
          ? { [targetFieldName]: true }
          : relationField.relationTargetFields?.some(
                (targetField) => targetField.name === 'name',
              )
            ? { name: true }
            : {}),
      },
    };
  }, {});
