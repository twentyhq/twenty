import { getOperationName } from '@apollo/client/utilities';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { FieldType } from '@/ui/data/field/types/FieldType';
import { IconBrandLinkedin } from '@/ui/display/icon';
import { GET_VIEW_FIELDS } from '@/views/graphql/queries/getViewFields';
import { GET_VIEWS } from '@/views/graphql/queries/getViews';
import { toViewFieldInput } from '@/views/hooks/internal/useViewFields';
import {
  useCreateViewFieldsMutation,
  useCreateViewMutation,
  ViewType,
} from '~/generated/graphql';

import { useCreateOneMetadataField } from './useCreateOneMetadataField';
import { useCreateOneMetadataObject } from './useCreateOneMetadataObject';
import { useUpdateOneMetadataField } from './useUpdateOneMetadataField';
import { useUpdateOneMetadataObject } from './useUpdateOneMetadataObject';

const useCreateActiveMetadataField = () => {
  const { createOneMetadataField } = useCreateOneMetadataField();
  const { updateOneMetadataField } = useUpdateOneMetadataField();

  return async ({
    objectId,
    label,
    name,
    type,
  }: {
    objectId: string;
    label: string;
    name: string;
    type: FieldType;
  }) => {
    const { data: createdField } = await createOneMetadataField({
      objectId: objectId,
      label: label,
      name: name,
      type: type,
      description: label,
      icon: 'IconMap',
    });

    if (!createdField || !createdField.createOneField.name) {
      throw new Error('Could not create metadata field');
    }

    await updateOneMetadataField({
      fieldIdToUpdate: createdField?.createOneField?.id ?? '',
      updatePayload: {
        isActive: true,
      },
    });

    return createdField.createOneField;
  };
};

export const useCreateNewTempsCustomObject = () => {
  const { createOneMetadataObject } = useCreateOneMetadataObject();

  const { updateOneMetadataObject } = useUpdateOneMetadataObject();

  const [createViewMutation] = useCreateViewMutation();
  const [createViewFieldsMutation] = useCreateViewFieldsMutation();

  const createActiveMetadataField = useCreateActiveMetadataField();

  return async () => {
    const date = new Date().toISOString().replace(/[\/:\.\-\_]/g, '');

    const { data: createdMetadataObject } = await createOneMetadataObject({
      labelPlural: 'Suppliers' + date,
      labelSingular: 'Supplier' + date,
      nameSingular: 'supplier' + date,
      namePlural: 'suppliers' + date,
      description: 'Suppliers' + date,
      icon: 'IconBuilding',
    });

    const supplierObjectId = createdMetadataObject?.createOneObject?.id ?? '';

    if (!createdMetadataObject) {
      throw new Error('Could not create metadata object');
    }

    await updateOneMetadataObject({
      idToUpdate: supplierObjectId,
      updatePayload: {
        isActive: true,
      },
    });

    const nameFieldData = await createActiveMetadataField({
      label: 'Name',
      name: 'name',
      objectId: supplierObjectId,
      type: 'text',
    });

    const cityFieldData = await createActiveMetadataField({
      label: 'City',
      name: 'city',
      objectId: supplierObjectId,
      type: 'text',
    });

    const emailFieldData = await createActiveMetadataField({
      label: 'Email',
      name: 'email',
      objectId: supplierObjectId,
      type: 'email',
    });

    const phoneFieldData = await createActiveMetadataField({
      label: 'Phone',
      name: 'phone',
      objectId: supplierObjectId,
      type: 'phone',
    });

    const twitterFieldData = await createActiveMetadataField({
      label: 'Twitter',
      name: 'twitter',
      objectId: supplierObjectId,
      type: 'url',
    });

    const booleanFieldData = await createActiveMetadataField({
      label: 'Boolean example',
      name: 'boolexample',
      objectId: supplierObjectId,
      type: 'boolean',
    });

    const employeesFieldData = await createActiveMetadataField({
      label: 'Employees',
      name: 'employees',
      objectId: supplierObjectId,
      type: 'number',
    });

    const ARRFieldData = await createActiveMetadataField({
      label: 'ARR',
      name: 'arr',
      objectId: supplierObjectId,
      type: 'money',
    });

    const createdAt = await createActiveMetadataField({
      label: 'Created at',
      name: 'createdAt',
      objectId: supplierObjectId,
      type: 'date',
    });

    const objectId = 'suppliers' + date;

    const { data: newView } = await createViewMutation({
      variables: {
        data: {
          name: 'Default',
          objectId: objectId,
          type: ViewType.Table,
        },
      },
      refetchQueries: [getOperationName(GET_VIEWS) ?? ''],
    });

    const createdFields = [
      emailFieldData,
      nameFieldData,
      cityFieldData,
      phoneFieldData,
      twitterFieldData,
      booleanFieldData,
      employeesFieldData,
      ARRFieldData,
      createdAt,
    ];

    const tempColumnDefinitions: ColumnDefinition<FieldMetadata>[] =
      createdFields.map((field, index) => ({
        index,
        key: field.name,
        name: field.label,
        size: 100,
        type: field.type as FieldType,
        metadata: {
          fieldName: field.name,
          placeHolder: field.label,
        },
        Icon: IconBrandLinkedin,
        isVisible: true,
      })) ?? [];

    await createViewFieldsMutation({
      variables: {
        data: tempColumnDefinitions.map((column) => ({
          ...toViewFieldInput(objectId, column),
          viewId: newView?.view.id ?? '',
        })),
      },
      refetchQueries: [getOperationName(GET_VIEW_FIELDS) ?? ''],
    });
  };
};
