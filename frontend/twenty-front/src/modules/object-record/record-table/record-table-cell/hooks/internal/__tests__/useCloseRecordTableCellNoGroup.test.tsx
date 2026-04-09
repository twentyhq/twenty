import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { CoreObjectNameSingular } from 'twenty-shared/types';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
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
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const recordTableId = 'record-table-id';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  return (
    <JotaiProvider store={jotaiStore}>
      <MockedProvider>
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={recordTableId}
        >
          <RecordTableComponentInstance recordTableId={recordTableId}>
            <RecordTableContextProvider
              recordTableId={recordTableId}
              viewBarId="viewBarId"
              objectNameSingular={CoreObjectNameSingular.Person}
              onRecordIdentifierClick={() => {}}
            >
              <FieldContext.Provider
                value={{
                  fieldDefinition: textfieldDefinition,
                  recordId: 'recordId',
                  isLabelIdentifier: false,
                  isRecordFieldReadOnly: false,
                }}
              >
                <RecordTableRowContextProvider
                  value={recordTableRowContextValue}
                >
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
        </RecordComponentInstanceContextsWrapper>
      </MockedProvider>
    </JotaiProvider>
  );
};

describe('useCloseRecordTableCellNoGroup', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const recordTableCellEditModePosition = useAtomComponentStateValue(
          recordTableCellEditModePositionComponentState,
          recordTableId,
        );

        return {
          ...useCloseRecordTableCellNoGroup(),
          ...useDragSelect(),
          recordTableCellEditModePosition,
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
    expect(result.current.recordTableCellEditModePosition).toBe(null);
  });
});
