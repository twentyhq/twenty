import { useObjectNamePluralForSelectOption } from '@/object-record/record-field/ui/meta-types/hooks/useObjectNamePluralForSelectOption';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const getWrapper = (initialPath: string, routePath: string) => {
  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({});

  return ({ children }: { children: ReactNode }) => (
    <JestMetadataAndApolloMocksWrapper>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path={routePath} element={children} />
        </Routes>
      </MemoryRouter>
    </JestMetadataAndApolloMocksWrapper>
  );
};

describe('useObjectNamePluralForSelectOption', () => {
  it('resolves the plural name from object metadata on a record show page', () => {
    const { result } = renderHook(
      () => useObjectNamePluralForSelectOption('person'),
      {
        wrapper: getWrapper(
          '/object/person/record-id',
          '/object/:objectNameSingular/:objectRecordId',
        ),
      },
    );

    expect(result.current.objectNamePlural).toBe('people');
  });

  it('falls back to the url param when the singular name is unknown', () => {
    const { result } = renderHook(
      () => useObjectNamePluralForSelectOption(undefined),
      {
        wrapper: getWrapper('/objects/people', '/objects/:objectNamePlural'),
      },
    );

    expect(result.current.objectNamePlural).toBe('people');
  });

  it('returns undefined when neither metadata nor the url provide it', () => {
    const { result } = renderHook(
      () => useObjectNamePluralForSelectOption('unknownObject'),
      { wrapper: getWrapper('/settings/profile', '/settings/profile') },
    );

    expect(result.current.objectNamePlural).toBeUndefined();
  });
});
