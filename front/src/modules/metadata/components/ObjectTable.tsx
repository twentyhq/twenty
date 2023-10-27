import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';

import { useUpdateOneObject } from '../hooks/useUpdateOneObject';
import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

import { ObjectDataTableEffect } from './ObjectDataTableEffect';

export type ObjectTableProps = Pick<
  MetadataObjectIdentifier,
  'objectNamePlural'
>;

export const ObjectTable = ({ objectNamePlural }: ObjectTableProps) => {
  const { updateOneObject } = useUpdateOneObject({
    objectNamePlural,
  });

  const updateEntity = ({
    variables,
  }: {
    variables: {
      where: { id: string };
      data: {
        [fieldName: string]: any;
      };
    };
  }) => {
    updateOneObject?.({
      idToUpdate: variables.where.id,
      input: variables.data,
    });
  };

  return (
    <TableContext.Provider
      value={{
        onColumnsChange: () => {
          //
        },
      }}
    >
      <ObjectDataTableEffect objectNamePlural={objectNamePlural} />

      <DataTable updateEntityMutation={updateEntity} />
    </TableContext.Provider>
  );
};
