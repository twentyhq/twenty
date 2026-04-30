import { renderHook } from '@testing-library/react';

import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

describe('useColorScheme', () => {
  it('exposes system, light, and dark schemes', async () => {
    const { result } = renderHook(() => useColorScheme());

    expect(result.current.colorScheme).toBe('System');
    expect(result.current.colorSchemeList).toEqual([
      expect.objectContaining({ id: 'System' }),
      expect.objectContaining({ id: 'Light' }),
      expect.objectContaining({ id: 'Dark' }),
    ]);

    await expect(result.current.setColorScheme('Dark')).resolves.toBeUndefined();
  });
});
