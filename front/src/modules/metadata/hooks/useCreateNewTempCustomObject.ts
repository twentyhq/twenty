import { getOperationName } from '@apollo/client/utilities';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { FieldType } from '@/ui/data/field/types/FieldType';
import { IconBrandLinkedin } from '@/ui/display/icon';
import { GET_VIEW_FIELDS } from '@/views/graphql/queries/getViewFields';
import { GET_VIEWS } from '@/views/graphql/queries/getViews';
import { toViewFieldInput } from '@/views/hooks/useTableViewFields';
import {
  useCreateViewFieldsMutation,
  useCreateViewMutation,
  ViewType,
} from '~/generated/graphql';

import { useCreateOneMetadataField } from './useCreateOneMetadataField';
import { useCreateOneMetadataObject } from './useCreateOneMetadataObject';
import { useUpdateOneMetadataField } from './useUpdateOneMetadataField';
import { useUpdateOneMetadataObject } from './useUpdateOneMetadataObject';

export const useCreateNewTempsCustomObject = () => {
  const { createOneMetadataObject } = useCreateOneMetadataObject();
  const { createOneMetadataField } = useCreateOneMetadataField();

  const { updateOneMetadataObject } = useUpdateOneMetadataObject();
  const { updateOneMetadataField } = useUpdateOneMetadataField();

  const [createViewMutation] = useCreateViewMutation();
  const [createViewFieldsMutation] = useCreateViewFieldsMutation();

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

    const { data: nameFieldData } = await createOneMetadataField({
      objectId: supplierObjectId,
      name: 'name',
      type: 'text',
      description: 'Name',
      label: 'Name',
      icon: 'IconBuilding',
    });

    if (!nameFieldData || !nameFieldData.createOneField.name) {
      throw new Error('Could not create metadata field');
    }

    await updateOneMetadataField({
      fieldIdToUpdate: nameFieldData?.createOneField?.id ?? '',
      updatePayload: {
        isActive: true,
      },
    });

    const { data: cityFieldData } = await createOneMetadataField({
      objectId: supplierObjectId,
      label: 'City',
      name: 'city',
      type: 'text',
      description: 'City',
      icon: 'IconMap',
    });

    if (!cityFieldData || !cityFieldData.createOneField.name) {
      throw new Error('Could not create metadata field');
    }

    await updateOneMetadataField({
      fieldIdToUpdate: cityFieldData?.createOneField?.id ?? '',
      updatePayload: {
        isActive: true,
      },
    });

    const { data: emailFieldData } = await createOneMetadataField({
      objectId: supplierObjectId,
      label: 'Email',
      name: 'email',
      type: 'url',
      description: 'Email',
      icon: 'IconMap',
    });

    if (!emailFieldData || !emailFieldData.createOneField.name) {
      throw new Error('Could not create metadata field');
    }

    await updateOneMetadataField({
      fieldIdToUpdate: emailFieldData?.createOneField?.id ?? '',
      updatePayload: {
        isActive: true,
      },
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
      emailFieldData.createOneField,
      nameFieldData.createOneField,
      cityFieldData.createOneField,
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
