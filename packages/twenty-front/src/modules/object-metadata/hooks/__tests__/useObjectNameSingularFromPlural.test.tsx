import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { TestObjectMetadataItemSetter } from '~/testing/test-helpers/TestObjectMetadataItemSetter';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';

describe('useObjectNameSingularFromPlural', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useObjectNameSingularFromPlural({ objectNamePlural: 'people' }),
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

    expect(result.current.objectNameSingular).toBe('person');
  });
});
