import { type ViewField } from '@/views/types/ViewField';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateViewFieldInput,
  type UpdateViewFieldMutationVariables,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type ViewFieldsToCreateAndUpdate = {
  viewFieldsToCreate: CreateViewFieldInput[];
  viewFieldsToUpdate: UpdateViewFieldMutationVariables[];
};

export const computeViewFieldsToCreateAndUpdate = ({
  newViewFields,
  existingViewFields,
  viewId,
}: {
  newViewFields: Omit<ViewField, 'definition'>[];
  existingViewFields: ViewField[];
  viewId: string;
}): ViewFieldsToCreateAndUpdate => {
  return newViewFields.reduce<ViewFieldsToCreateAndUpdate>(
    (accumulator, newViewField) => {
      const existingViewField = existingViewFields.find(
        (existingField) =>
          existingField.fieldMetadataId === newViewField.fieldMetadataId,
      );

      if (!isDefined(existingViewField)) {
        return {
          viewFieldsToCreate: [
            ...accumulator.viewFieldsToCreate,
            {
              id: newViewField.id,
              fieldMetadataId: newViewField.fieldMetadataId,
              position: newViewField.position,
              isVisible: newViewField.isVisible,
              size: newViewField.size,
              aggregateOperation: newViewField.aggregateOperation,
              viewId,
            },
          ],
          viewFieldsToUpdate: accumulator.viewFieldsToUpdate,
        };
      }

      if (
        isDeeplyEqual(
          {
            position: existingViewField.position,
            size: existingViewField.size,
            isVisible: existingViewField.isVisible,
            aggregateOperation: existingViewField.aggregateOperation,
          },
          {
            position: newViewField.position,
            size: newViewField.size,
            isVisible: newViewField.isVisible,
            aggregateOperation: newViewField.aggregateOperation,
          },
        )
      ) {
        return accumulator;
      }

      return {
        viewFieldsToCreate: accumulator.viewFieldsToCreate,
        viewFieldsToUpdate: [
          ...accumulator.viewFieldsToUpdate,
          {
            input: {
              id: existingViewField.id,
              update: {
                isVisible: newViewField.isVisible,
                position: newViewField.position,
                size: newViewField.size,
                aggregateOperation: newViewField.aggregateOperation,
              },
            },
          },
        ],
      };
    },
    { viewFieldsToCreate: [], viewFieldsToUpdate: [] },
  );
};
