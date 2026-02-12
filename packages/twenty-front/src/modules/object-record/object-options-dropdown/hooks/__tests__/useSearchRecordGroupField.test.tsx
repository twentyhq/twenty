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
      { type: FieldMetadataType.SELECT, label: 'First', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Second', isActive: true },
      { type: FieldMetadataType.TEXT, label: 'Third', isActive: true },
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
      { type: FieldMetadataType.SELECT, label: 'First', isActive: true },
    ]);
  });

  it('returns all select fields when search input is empty', () => {
    const fields = [
      { type: FieldMetadataType.SELECT, label: 'First', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Second', isActive: true },
      { type: FieldMetadataType.TEXT, label: 'Third', isActive: true },
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
      { type: FieldMetadataType.SELECT, label: 'First', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Second', isActive: true },
    ]);
  });

  it('filters out inactive SELECT fields', () => {
    const fields = [
      { type: FieldMetadataType.SELECT, label: 'Active Field', isActive: true },
      {
        type: FieldMetadataType.SELECT,
        label: 'Inactive Field',
        isActive: false,
      },
      { type: FieldMetadataType.TEXT, label: 'Text Field', isActive: true },
    ];
    const mockContextValue = {
      objectMetadataItem: {
        fields,
        readableFields: fields,
        updatableFields: fields,
      },
    };

    const { result } = renderWithContext(mockContextValue);

    expect(result.current.filteredRecordGroupFieldMetadataItems).toHaveLength(
      1,
    );
    expect(result.current.filteredRecordGroupFieldMetadataItems[0].label).toBe(
      'Active Field',
    );
  });

  it('performs case-insensitive search', () => {
    const fields = [
      { type: FieldMetadataType.SELECT, label: 'Status', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Priority', isActive: true },
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
      result.current.setRecordGroupFieldSearchInput('STATUS');
    });

    expect(result.current.filteredRecordGroupFieldMetadataItems).toEqual([
      { type: FieldMetadataType.SELECT, label: 'Status', isActive: true },
    ]);
  });

  it('returns empty array when no fields match search', () => {
    const fields = [
      { type: FieldMetadataType.SELECT, label: 'Status', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Priority', isActive: true },
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
      result.current.setRecordGroupFieldSearchInput('nonexistent');
    });

    expect(result.current.filteredRecordGroupFieldMetadataItems).toEqual([]);
  });

  it('returns partial matches in search', () => {
    const fields = [
      { type: FieldMetadataType.SELECT, label: 'User Status', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Task Status', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Priority', isActive: true },
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
      result.current.setRecordGroupFieldSearchInput('Status');
    });

    expect(result.current.filteredRecordGroupFieldMetadataItems).toHaveLength(
      2,
    );
    expect(result.current.filteredRecordGroupFieldMetadataItems).toEqual([
      { type: FieldMetadataType.SELECT, label: 'User Status', isActive: true },
      { type: FieldMetadataType.SELECT, label: 'Task Status', isActive: true },
    ]);
  });

  it('returns empty array when no SELECT fields exist', () => {
    const fields = [
      { type: FieldMetadataType.TEXT, label: 'Name', isActive: true },
      { type: FieldMetadataType.NUMBER, label: 'Count', isActive: true },
    ];
    const mockContextValue = {
      objectMetadataItem: {
        fields,
        readableFields: fields,
        updatableFields: fields,
      },
    };

    const { result } = renderWithContext(mockContextValue);

    expect(result.current.filteredRecordGroupFieldMetadataItems).toEqual([]);
  });
});
