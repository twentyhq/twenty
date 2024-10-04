import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { mocks } from '@/auth/hooks/__mocks__/useAuth';
import { useLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
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
        <RecordTableScope
          recordTableScopeId={getScopeIdFromComponentId(recordTableId)}
          onColumnsChange={onColumnsChange}
        >
          {children}
        </RecordTableScope>
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
