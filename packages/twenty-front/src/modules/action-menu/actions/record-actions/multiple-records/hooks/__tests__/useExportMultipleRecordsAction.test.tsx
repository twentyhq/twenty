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
import { useExportMultipleRecordsAction } from '../useExportMultipleRecordsAction';

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useExportMultipleRecordsAction', () => {
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

  it('should register export multiple records action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useExportMultipleRecordsAction: useExportMultipleRecordsAction({
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useExportMultipleRecordsAction.registerExportMultipleRecordsAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);
    expect(
      result.current.actionMenuEntries.get('export-multiple-records'),
    ).toBeDefined();
    expect(
      result.current.actionMenuEntries.get('export-multiple-records')?.position,
    ).toBe(1);
  });

  it('should unregister export multiple records action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useExportMultipleRecordsAction: useExportMultipleRecordsAction({
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useExportMultipleRecordsAction.registerExportMultipleRecordsAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);

    act(() => {
      result.current.useExportMultipleRecordsAction.unregisterExportMultipleRecordsAction();
    });

    expect(result.current.actionMenuEntries.size).toBe(0);
  });
});
