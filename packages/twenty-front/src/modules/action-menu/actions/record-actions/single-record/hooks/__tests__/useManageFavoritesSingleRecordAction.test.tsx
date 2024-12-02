import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useManageFavoritesSingleRecordAction } from '../useManageFavoritesSingleRecordAction';

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useManageFavoritesSingleRecordAction', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <JestMetadataAndApolloMocksWrapper>
      <JestObjectMetadataItemSetter>
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
      </JestObjectMetadataItemSetter>
    </JestMetadataAndApolloMocksWrapper>
  );

  it('should register manage favorites action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useManageFavoritesSingleRecordAction:
            useManageFavoritesSingleRecordAction({
              recordId: 'record1',
              objectMetadataItem: companyMockObjectMetadataItem,
            }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useManageFavoritesSingleRecordAction.registerManageFavoritesSingleRecordAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);
    expect(
      result.current.actionMenuEntries.get('manage-favorites-single-record'),
    ).toBeDefined();
    expect(
      result.current.actionMenuEntries.get('manage-favorites-single-record')
        ?.position,
    ).toBe(1);
  });

  it('should unregister manage favorites action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useManageFavoritesSingleRecordAction:
            useManageFavoritesSingleRecordAction({
              recordId: 'record1',
              objectMetadataItem: companyMockObjectMetadataItem,
            }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useManageFavoritesSingleRecordAction.registerManageFavoritesSingleRecordAction(
        { position: 1 },
      );
    });

    act(() => {
      result.current.useManageFavoritesSingleRecordAction.unregisterManageFavoritesSingleRecordAction();
    });

    expect(result.current.actionMenuEntries.size).toBe(0);
  });
});
