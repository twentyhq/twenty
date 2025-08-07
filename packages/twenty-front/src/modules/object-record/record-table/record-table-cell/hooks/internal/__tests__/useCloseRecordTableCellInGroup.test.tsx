import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { textfieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import {
  recordTableCellContextValue,
  recordTableRowContextValue,
  recordTableRowDraggableContextValue,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useCloseRecordTableCellInGroup } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCellInGroup';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const onColumnsChange = jest.fn();
const recordTableId = 'record-table-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot
    initializeState={(snapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
    }}
  >
    <RecordTableComponentInstance
      recordTableId={recordTableId}
      onColumnsChange={onColumnsChange}
    >
      <RecordTableContextProvider
        recordTableId={recordTableId}
        viewBarId="viewBarId"
        objectNameSingular={CoreObjectNameSingular.Person}
      >
        <FieldContext.Provider
          value={{
            fieldDefinition: textfieldDefinition,
            recordId: 'recordId',
            isLabelIdentifier: false,
            isRecordFieldReadOnly: false,
          }}
        >
          <RecordTableRowContextProvider value={recordTableRowContextValue}>
            <RecordTableRowDraggableContextProvider
              value={recordTableRowDraggableContextValue}
            >
              <RecordTableCellContext.Provider
                value={{ ...recordTableCellContextValue }}
              >
                {children}
              </RecordTableCellContext.Provider>
            </RecordTableRowDraggableContextProvider>
          </RecordTableRowContextProvider>
        </FieldContext.Provider>
      </RecordTableContextProvider>
    </RecordTableComponentInstance>
  </RecoilRoot>
);

describe('useCloseRecordTableCellInGroup', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const currentTableCellInEditModePosition = useRecoilComponentValue(
          recordTableCellEditModePositionComponentState,
        );
        return {
          ...useCloseRecordTableCellInGroup(),
          ...useDragSelect(),
          currentTableCellInEditModePosition,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.closeTableCellInGroup();
    });

    expect(result.current.isDragSelectionStartEnabled()).toBe(true);
    expect(result.current.currentTableCellInEditModePosition).toBe(null);
  });
});
