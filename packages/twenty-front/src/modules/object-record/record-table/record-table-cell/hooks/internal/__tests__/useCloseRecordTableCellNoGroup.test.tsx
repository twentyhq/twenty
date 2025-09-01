import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { textfieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
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
import { useCloseRecordTableCellNoGroup } from '@/object-record/record-table/record-table-cell/hooks/internal/useCloseRecordTableCellNoGroup';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const recordTableId = 'record-table-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot
    initializeState={(snapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
    }}
  >
    <RecordTableComponentInstance recordTableId={recordTableId}>
      <RecordTableContextProvider
        recordTableId={recordTableId}
        viewBarId="viewBarId"
        objectNameSingular={CoreObjectNameSingular.Person}
        onRecordIdentifierClick={() => {}}
      >
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={recordTableId}
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
        </RecordComponentInstanceContextsWrapper>
      </RecordTableContextProvider>
    </RecordTableComponentInstance>
  </RecoilRoot>
);

describe('useCloseRecordTableCellNoGroup', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const currentTableCellInEditModePosition = useRecoilComponentValue(
          recordTableCellEditModePositionComponentState,
        );

        return {
          ...useCloseRecordTableCellNoGroup(),
          ...useDragSelect(),
          currentTableCellInEditModePosition,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.closeTableCellNoGroup();
    });

    expect(result.current.isDragSelectionStartEnabled()).toBe(true);
    expect(result.current.currentTableCellInEditModePosition).toBe(null);
  });
});
