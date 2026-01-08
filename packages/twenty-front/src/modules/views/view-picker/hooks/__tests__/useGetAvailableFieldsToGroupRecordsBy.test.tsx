import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, type MutableSnapshot } from 'recoil';
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
  return ({ children }: { children: ReactNode }) => (
    <RecoilRoot
      initializeState={(snapshot: MutableSnapshot) => {
        snapshot.set(objectMetadataItemsState, objectMetadataItems);
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
  );
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
