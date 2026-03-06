import { renderHook } from '@testing-library/react';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

describe('useObjectNamePluralFromSingular', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useObjectNamePluralFromSingular({ objectNameSingular: 'person' }),
      {
        wrapper: ({ children }) => (
          <JestObjectMetadataItemSetter>
            {children}
          </JestObjectMetadataItemSetter>
        ),
      },
    );

    expect(result.current.objectNamePlural).toBe('people');
  });
});
