import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
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

describe('useGetAvailableFieldsForCalendar', () => {
  it('should return only DATE and DATE_TIME fields', () => {
    const fields = [
      {
        id: '1',
        type: FieldMetadataType.DATE,
        label: 'Due Date',
        isActive: true,
      },
      {
        id: '2',
        type: FieldMetadataType.DATE_TIME,
        label: 'Created At',
        isActive: true,
      },
      {
        id: '3',
        type: FieldMetadataType.TEXT,
        label: 'Name',
        isActive: true,
      },
      {
        id: '4',
        type: FieldMetadataType.NUMBER,
        label: 'Count',
        isActive: true,
      },
    ];

    const objectMetadataItems = [createMockObjectMetadataItem(fields)];
    const wrapper = createWrapper(objectMetadataItems);

    const { result } = renderHook(() => useGetAvailableFieldsForCalendar(), {
      wrapper,
    });

    expect(result.current.availableFieldsForCalendar).toHaveLength(2);
    expect(result.current.availableFieldsForCalendar).toEqual([
      {
        id: '1',
        type: FieldMetadataType.DATE,
        label: 'Due Date',
        isActive: true,
      },
      {
        id: '2',
        type: FieldMetadataType.DATE_TIME,
        label: 'Created At',
        isActive: true,
      },
    ]);
  });

  it('should return the navigateToDateFieldSettings function', () => {
    const fields = [
      {
        id: '1',
        type: FieldMetadataType.DATE,
        label: 'Due Date',
        isActive: true,
      },
    ];

    const objectMetadataItems = [createMockObjectMetadataItem(fields)];
    const wrapper = createWrapper(objectMetadataItems);

    const { result } = renderHook(() => useGetAvailableFieldsForCalendar(), {
      wrapper,
    });

    expect(result.current.navigateToDateFieldSettings).toBeDefined();
    expect(typeof result.current.navigateToDateFieldSettings).toBe('function');
  });
});
