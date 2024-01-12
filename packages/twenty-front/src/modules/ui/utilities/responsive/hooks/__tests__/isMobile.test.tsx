import { renderHook } from '@testing-library/react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

describe('useIsMobile', () => {
  it('should trigger the callback when clicking outside the specified refs', () => {
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});
