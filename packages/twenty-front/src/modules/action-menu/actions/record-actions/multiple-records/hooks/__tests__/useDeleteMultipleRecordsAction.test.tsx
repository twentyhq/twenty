import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useDeleteMultipleRecordsAction } from '../useDeleteMultipleRecordsAction';

jest.mock('@/object-record/hooks/useDeleteManyRecords', () => ({
  useDeleteManyRecords: () => ({
    deleteManyRecords: jest.fn(),
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

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
  onInitializeRecoilSnapshot: ({ set }) => {
    set(
      contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
        instanceId: '1',
      }),
      3,
    );
  },
});

describe('useDeleteMultipleRecordsAction', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <JestMetadataAndApolloMocksWrapper>
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
    </JestMetadataAndApolloMocksWrapper>
  );

  it('should register delete action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useDeleteMultipleRecordsAction: useDeleteMultipleRecordsAction({
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useDeleteMultipleRecordsAction.registerDeleteMultipleRecordsAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);
    expect(
      result.current.actionMenuEntries.get('delete-multiple-records'),
    ).toBeDefined();
    expect(
      result.current.actionMenuEntries.get('delete-multiple-records')?.position,
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
          useDeleteMultipleRecordsAction: useDeleteMultipleRecordsAction({
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useDeleteMultipleRecordsAction.registerDeleteMultipleRecordsAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);

    act(() => {
      result.current.useDeleteMultipleRecordsAction.unregisterDeleteMultipleRecordsAction();
    });

    expect(result.current.actionMenuEntries.size).toBe(0);
  });
});
