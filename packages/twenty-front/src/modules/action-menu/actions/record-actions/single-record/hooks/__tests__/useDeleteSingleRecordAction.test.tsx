import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
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
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useDeleteSingleRecordAction: useDeleteSingleRecordAction({
            recordId: 'record1',
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useDeleteSingleRecordAction.registerDeleteSingleRecordAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);
    expect(
      result.current.actionMenuEntries.get('delete-single-record'),
    ).toBeDefined();
    expect(
      result.current.actionMenuEntries.get('delete-single-record')?.position,
    ).toBe(1);
  });

  it('should unregister delete action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useDeleteSingleRecordAction: useDeleteSingleRecordAction({
            recordId: 'record1',
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useDeleteSingleRecordAction.registerDeleteSingleRecordAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);

    act(() => {
      result.current.useDeleteSingleRecordAction.unregisterDeleteSingleRecordAction();
    });

    expect(result.current.actionMenuEntries.size).toBe(0);
  });
});
