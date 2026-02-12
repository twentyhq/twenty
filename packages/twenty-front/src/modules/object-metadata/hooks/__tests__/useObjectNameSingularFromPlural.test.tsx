import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';

describe('useObjectNameSingularFromPlural', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useObjectNameSingularFromPlural({ objectNamePlural: 'people' }),
      {
        wrapper: ({ children }) => (
          <RecoilRoot>
            <JestObjectMetadataItemSetter>
              {children}
            </JestObjectMetadataItemSetter>
          </RecoilRoot>
        ),
      },
    );

    expect(result.current.objectNameSingular).toBe('person');
  });
});
