import { type ReactNode, useCallback } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordTableContextProvider as RecordTableContextInternalProvider } from '@/object-record/record-table/contexts/RecordTableContext';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordUpdateHookParams } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { RECORD_TABLE_COLUMN_MIN_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnMinWidth';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';

type RecordTableContextProviderProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  onRecordIdentifierClick?: (rowIndex: number, recordId: string) => void;
  children: ReactNode;
};

export const RecordTableContextProvider = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  onRecordIdentifierClick,
  children,
}: RecordTableContextProviderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const { updateOneRecord } = useUpdateOneRecord();

  const updateRecord = useCallback(
    ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord({
        objectNameSingular,
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    },
    [objectNameSingular, updateOneRecord],
  );

  const recordIndexOpenRecordIn = useAtomStateValue(
    recordIndexOpenRecordInState,
  );
  const triggerEvent =
    recordIndexOpenRecordIn === ViewOpenRecordIn.SIDE_PANEL
      ? 'CLICK'
      : 'MOUSE_DOWN';

  return (
    <RecordFieldsScopeContextProvider
      value={{ scopeInstanceId: RECORD_TABLE_CELL_INPUT_ID_PREFIX }}
    >
      <RecordTableContextInternalProvider
        value={{
          viewBarId,
          objectMetadataItem,
          objectMetadataItems,
          recordTableId,
          objectNameSingular,
          objectPermissions,
          visibleRecordFields: visibleRecordFields.map((field) => ({
            ...field,
            size: Math.max(field.size, RECORD_TABLE_COLUMN_MIN_WIDTH),
          })),
          onRecordIdentifierClick,
          triggerEvent,
        }}
      >
        <RecordTableUpdateContext.Provider value={updateRecord}>
          {children}
        </RecordTableUpdateContext.Provider>
      </RecordTableContextInternalProvider>
    </RecordFieldsScopeContextProvider>
  );
};
