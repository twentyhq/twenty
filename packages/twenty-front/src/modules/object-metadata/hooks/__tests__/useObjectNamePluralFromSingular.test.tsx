import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { TestObjectMetadataItemSetter } from '~/testing/test-helpers/TestObjectMetadataItemSetter';
import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';

describe('useObjectNamePluralFromSingular', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useObjectNamePluralFromSingular({ objectNameSingular: 'person' }),
      {
        wrapper: ({ children }) => (
          <RecoilRoot>
            <TestObjectMetadataItemSetter>
              {children}
            </TestObjectMetadataItemSetter>
          </RecoilRoot>
        ),
      },
    );

    expect(result.current.objectNamePlural).toBe('people');
  });
});
