import { renderHook } from '@testing-library/react';

import { useUpdateEffect } from '~/hooks/useUpdateEffect';

describe('useUpdateEffect', () => {
  it('should call the effect callback on update', () => {
    const effect = jest.fn();
    const { rerender } = renderHook(() => {
      useUpdateEffect(effect);
    });

    expect(effect).not.toHaveBeenCalled();

    rerender();

    expect(effect).toHaveBeenCalledTimes(1);
  });
});
