import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const mockObjectMetadataId = 'test-object-id';
const mockViewInstanceId = 'test-view-instance-id';

const createMockObjectMetadataItem = (fields: any[]) => ({
  id: mockObjectMetadataId,
  namePlural: 'testObjects',
  nameSingular: 'testObject',
  readableFields: fields,
  fields,
});

const createWrapper = (objectMetadataItems: any[]) => {
  return ({ children }: { children: ReactNode }) => {
    jotaiStore.set(objectMetadataItemsState.atom, objectMetadataItems);
    return (
      <JotaiProvider store={jotaiStore}>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(
              viewObjectMetadataIdComponentState.atomFamily({
                instanceId: mockViewInstanceId,
              }),
              mockObjectMetadataId,
            );
          }}
        >
          <MemoryRouter>
            <ViewComponentInstanceContext.Provider
              value={{ instanceId: mockViewInstanceId }}
            >
              {children}
            </ViewComponentInstanceContext.Provider>
          </MemoryRouter>
        </RecoilRoot>
      </JotaiProvider>
    );
  };
};

describe('useGetAvailableFieldsToGroupRecordsBy', () => {
  it('should filter out inactive SELECT fields', () => {
    const fields = [
      {
        id: '1',
        type: FieldMetadataType.SELECT,
        label: 'Active Status',
        isActive: true,
      },
      {
        id: '2',
        type: FieldMetadataType.SELECT,
        label: 'Inactive Status',
        isActive: false,
      },
    ];

    const objectMetadataItems = [createMockObjectMetadataItem(fields)];
    const wrapper = createWrapper(objectMetadataItems);

    const { result } = renderHook(
      () => useGetAvailableFieldsToGroupRecordsBy(),
      {
        wrapper,
      },
    );

    expect(result.current.availableFieldsForGrouping).toHaveLength(1);
    expect(result.current.availableFieldsForGrouping[0].label).toBe(
      'Active Status',
    );
  });

  it('should return the navigateToSelectSettings function', () => {
    const fields = [
      {
        id: '1',
        type: FieldMetadataType.SELECT,
        label: 'Status',
        isActive: true,
      },
    ];

    const objectMetadataItems = [createMockObjectMetadataItem(fields)];
    const wrapper = createWrapper(objectMetadataItems);

    const { result } = renderHook(
      () => useGetAvailableFieldsToGroupRecordsBy(),
      {
        wrapper,
      },
    );

    expect(result.current.navigateToSelectSettings).toBeDefined();
    expect(typeof result.current.navigateToSelectSettings).toBe('function');
  });
});
