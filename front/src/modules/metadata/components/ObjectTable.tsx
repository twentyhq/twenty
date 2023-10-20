import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ViewBarContext } from '@/ui/data/view-bar/contexts/ViewBarContext';

import { useMetadataTableViews } from '../hooks/useMetadataTableViews';
import { useUpdateOneObject } from '../hooks/useUpdateOneObject';
import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

import { ObjectDataTableEffect } from './ObjectDataTableEffect';

export type ObjectTableProps = MetadataObjectIdentifier;

export const ObjectTable = ({ objectNamePlural }: ObjectTableProps) => {
  const { createView, deleteView, submitCurrentView, updateView } =
    useMetadataTableViews();

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
      <ViewBarContext.Provider
        value={{
          defaultViewName: `All ${objectNamePlural}`,
          onCurrentViewSubmit: submitCurrentView,
          onViewCreate: createView,
          onViewEdit: updateView,
          onViewRemove: deleteView,
          ViewBarRecoilScopeContext: TableRecoilScopeContext,
        }}
      >
        <DataTable updateEntityMutation={updateEntity} />
      </ViewBarContext.Provider>
    </TableContext.Provider>
  );
};
