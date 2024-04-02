import { v4 } from 'uuid';

import { Field } from '~/generated/graphql';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from '../types/FieldMetadataItem';
import { FieldMetadataOption } from '../types/FieldMetadataOption';
import { formatFieldMetadataItemInput } from '../utils/formatFieldMetadataItemInput';

import { useCreateOneFieldMetadataItem } from './useCreateOneFieldMetadataItem';
import { useDeleteOneFieldMetadataItem } from './useDeleteOneFieldMetadataItem';
import { useUpdateOneFieldMetadataItem } from './useUpdateOneFieldMetadataItem';

export const useFieldMetadataItem = () => {
  const { createOneFieldMetadataItem } = useCreateOneFieldMetadataItem();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();
  const { deleteOneFieldMetadataItem } = useDeleteOneFieldMetadataItem();

  const createMetadataField = (
    input: Pick<Field, 'label' | 'icon' | 'description' | 'defaultValue'> & {
      defaultValue?: unknown;
      objectMetadataId: string;
      options?: Omit<FieldMetadataOption, 'id'>[];
      type: FieldMetadataType;
    },
  ) => {
    const formatedInput = formatFieldMetadataItemInput(input);
    const defaultValue = input.defaultValue
      ? typeof input.defaultValue == 'string'
        ? `'${input.defaultValue}'`
        : input.defaultValue
      : formatedInput.defaultValue ?? undefined;

    return createOneFieldMetadataItem({
      ...formatedInput,
      defaultValue,
      objectMetadataId: input.objectMetadataId,
      type: input.type,
    });
  };

  const editMetadataField = (
    input: Pick<
      Field,
      'id' | 'label' | 'icon' | 'description' | 'defaultValue'
    > & {
      options?: FieldMetadataOption[];
    },
  ) => {
    const formatedInput = formatFieldMetadataItemInput(input);
    const defaultValue = input.defaultValue
      ? typeof input.defaultValue == 'string'
        ? `'${input.defaultValue}'`
        : input.defaultValue
      : formatedInput.defaultValue ?? undefined;

    return updateOneFieldMetadataItem({
      fieldMetadataIdToUpdate: input.id,
      updatePayload: formatFieldMetadataItemInput({
        ...input,
        defaultValue,
        // In Edit mode, all options need an id,
        // so we generate an id for newly created options.
        options: input.options?.map((option) =>
          option.id ? option : { ...option, id: v4() },
        ),
      }),
    });
  };

  const activateMetadataField = (metadataField: FieldMetadataItem) =>
    updateOneFieldMetadataItem({
      fieldMetadataIdToUpdate: metadataField.id,
      updatePayload: { isActive: true },
    });

  const disableMetadataField = (metadataField: FieldMetadataItem) =>
    updateOneFieldMetadataItem({
      fieldMetadataIdToUpdate: metadataField.id,
      updatePayload: { isActive: false },
    });

  const eraseMetadataField = (metadataField: FieldMetadataItem) =>
    deleteOneFieldMetadataItem(metadataField.id);

  return {
    activateMetadataField,
    createMetadataField,
    disableMetadataField,
    eraseMetadataField,
    editMetadataField,
  };
};
