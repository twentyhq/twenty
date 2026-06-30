import React from 'react';
import { renderHook } from '@testing-library/react';

import { useCombinedRefs } from '~/hooks/useCombinedRefs';

describe('useCombinedRefs', () => {
  it('should combine refs', () => {
    const { result } = renderHook(() => {
      const ref1 = React.useRef<string>(null);
      const ref2 = React.useRef<string>(null);
      const refCallback = useCombinedRefs(ref1, ref2);

      React.useEffect(() => {
        refCallback('test');
      }, [refCallback]);

      return [ref1, ref2];
    });

    expect(result.current[0].current).toBe('test');
    expect(result.current[1].current).toBe('test');
  });
});
