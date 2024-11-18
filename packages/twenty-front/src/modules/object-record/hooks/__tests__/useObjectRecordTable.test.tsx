import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { mocks } from '@/auth/hooks/__mocks__/useAuth';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const recordTableId = 'people';
const objectNameSingular = 'person';
const onColumnsChange = jest.fn();

const ObjectNamePluralSetter = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

const HookMockWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <HookMockWrapper>
      <ObjectNamePluralSetter>
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: 'instanceId' }}
        >
          <RecordTableComponentInstance
            recordTableId={recordTableId}
            onColumnsChange={onColumnsChange}
          >
            <RecordGroupContext.Provider value={{ recordGroupId: 'default' }}>
              {children}
            </RecordGroupContext.Provider>
          </RecordTableComponentInstance>
        </ViewComponentInstanceContext.Provider>
      </ObjectNamePluralSetter>
    </HookMockWrapper>
  );
};

describe('useObjectRecordTable', () => {
  it('should skip fetch if currentWorkspace is undefined', async () => {
    const { result } = renderHook(
      () => useLoadRecordIndexTable(objectNameSingular),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(false);
    expect(Array.isArray(result.current.records)).toBe(true);
    expect(result.current.records.length).toBe(13);
  });
});
