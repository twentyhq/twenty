import { RsiProps } from '@/spreadsheet-import/types';
import { fieldsForEntity } from '@/spreadsheet-import/utils/fieldsForEntity';
import {
  useInsertManyCompanyMutation,
  useInsertManyPersonMutation,
} from '~/generated/graphql';

import { useSpreadsheetImport } from './useSpreadsheetImport';

export type EntityMutationMap = {
  Person: typeof useInsertManyPersonMutation;
  Company: typeof useInsertManyCompanyMutation;
};

export type EntityName = keyof EntityMutationMap;

export type FieldMapping = {
  [K in EntityName]: (typeof fieldsForEntity)[K][number]['key'];
};

export function useSpreadsheetEntityImport<Entity extends EntityName>({
  entityName,
  mutationHook,
}: {
  entityName: Entity;
  mutationHook: EntityMutationMap[Entity];
}) {
  const { openSpreadsheetImport } =
    useSpreadsheetImport<FieldMapping[Entity]>();

  const [createEntities] = mutationHook();

  const fields = fieldsForEntity[entityName];

  const openEntitySpreadsheetImport = (
    options: Omit<
      RsiProps<FieldMapping[Entity]>,
      'fields' | 'isOpen' | 'onClose'
    >,
  ) => {
    openSpreadsheetImport({
      ...options,
      async onSubmit(data) {
        await createEntities({
          variables: {
            data: data.validData,
          },
        });
        // data.validData.map((item) => {
        //   if (isEntityOfType(item, entityName)) {
        //     switch (entityName) {
        //       case 'Person':
        //         break;
        //       case 'Company':
        //         break;
        //     }
        //   }
        // });
      },
      // TODO: correct this error
      fields: fields as any,
    });
  };

  return { openEntitySpreadsheetImport };
}
