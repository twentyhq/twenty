import { renderHook } from '@testing-library/react';

import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';

describe('useObjectNameSingularFromPlural', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useObjectNameSingularFromPlural({ objectNamePlural: 'people' }),
      {
        wrapper: ({ children }) => (
          <JestObjectMetadataItemSetter>
            {children}
          </JestObjectMetadataItemSetter>
        ),
      },
    );

    expect(result.current.objectNameSingular).toBe('person');
  });
});
