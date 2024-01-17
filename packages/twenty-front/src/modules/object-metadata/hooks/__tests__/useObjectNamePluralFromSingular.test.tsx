import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useObjectNamePluralFromSingular } from '../useObjectNamePluralFromSingular';

describe('useObjectNamePluralFromSingular', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useObjectNamePluralFromSingular({ objectNameSingular: 'person' }),
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current.objectNamePlural).toBe('people');
  });
});
