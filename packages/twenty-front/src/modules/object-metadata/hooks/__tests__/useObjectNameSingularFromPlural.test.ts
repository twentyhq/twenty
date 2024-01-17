import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useObjectNameSingularFromPlural } from '../useObjectNameSingularFromPlural';

describe('useObjectNameSingularFromPlural', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useObjectNameSingularFromPlural({ objectNamePlural: 'people' }),
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current.objectNameSingular).toBe('person');
  });
});
