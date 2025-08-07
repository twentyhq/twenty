import { useSearchRecordGroupField } from '@/object-record/object-options-dropdown/hooks/useSearchRecordGroupField';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('useSearchRecordGroupField', () => {
  const renderWithContext = (contextValue: any) =>
    renderHook(() => useSearchRecordGroupField(), {
      wrapper: ({ children }) => (
        <RecoilRoot>
          <RecordIndexContextProvider value={contextValue}>
            <ViewComponentInstanceContext.Provider
              value={{ instanceId: 'myViewInstanceId' }}
            >
              {children}
            </ViewComponentInstanceContext.Provider>
          </RecordIndexContextProvider>
        </RecoilRoot>
      ),
    });

  it('filters fields correctly based on input', () => {
    const fields = [
      { type: FieldMetadataType.SELECT, label: 'First' },
      { type: FieldMetadataType.SELECT, label: 'Second' },
      { type: FieldMetadataType.TEXT, label: 'Third' },
    ];
    const mockContextValue = {
      objectMetadataItem: {
        fields,
        readableFields: fields,
        updatableFields: fields,
      },
    };

    const { result } = renderWithContext(mockContextValue);

    act(() => {
      result.current.setRecordGroupFieldSearchInput('First');
    });

    expect(result.current.filteredRecordGroupFieldMetadataItems).toEqual([
      { type: FieldMetadataType.SELECT, label: 'First' },
    ]);
  });

  it('returns all select fields when search input is empty', () => {
    const fields = [
      { type: FieldMetadataType.SELECT, label: 'First' },
      { type: FieldMetadataType.SELECT, label: 'Second' },
      { type: FieldMetadataType.TEXT, label: 'Third' },
    ];
    const mockContextValue = {
      objectMetadataItem: {
        fields,
        readableFields: fields,
        updatableFields: fields,
      },
    };

    const { result } = renderWithContext(mockContextValue);

    expect(result.current.filteredRecordGroupFieldMetadataItems).toEqual([
      { type: FieldMetadataType.SELECT, label: 'First' },
      { type: FieldMetadataType.SELECT, label: 'Second' },
    ]);
  });
});
