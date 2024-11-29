import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useDeleteSingleRecordAction } from '../useDeleteSingleRecordAction';

jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({
    deleteOneRecord: jest.fn(),
  }),
}));
jest.mock('@/favorites/hooks/useDeleteFavorite', () => ({
  useDeleteFavorite: () => ({
    deleteFavorite: jest.fn(),
  }),
}));
jest.mock('@/favorites/hooks/useFavorites', () => ({
  useFavorites: () => ({
    sortedFavorites: [],
  }),
}));
jest.mock('@/object-record/record-table/hooks/useRecordTable', () => ({
  useRecordTable: () => ({
    resetTableRowSelection: jest.fn(),
  }),
}));

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

describe('useDeleteSingleRecordAction', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: '1',
        }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{
            instanceId: '1',
          }}
        >
          {children}
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecoilRoot>
  );

  it('should register delete action', () => {
    const { result } = renderHook(
      () =>
        useDeleteSingleRecordAction({
          recordId: 'record1',
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      { wrapper },
    );

    act(() => {
      result.current.registerDeleteSingleRecordAction({ position: 0 });
    });

    const { result: actionMenuEntriesResult } = renderHook(
      () => useRecoilComponentValueV2(actionMenuEntriesComponentState),
      {
        wrapper,
      },
    );

    expect(actionMenuEntriesResult.current.size).toBe(1);
  });
});
