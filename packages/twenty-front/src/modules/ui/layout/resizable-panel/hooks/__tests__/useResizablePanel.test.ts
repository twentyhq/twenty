import { renderHook } from '@testing-library/react';

import { useResizablePanel } from '@/ui/layout/resizable-panel/hooks/useResizablePanel';

const CSS_VARIABLE_NAME = '--test-panel-width';

describe('useResizablePanel', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty(CSS_VARIABLE_NAME);
  });

  it('keeps the CSS variable set by its owner when the panel unmounts', () => {
    document.documentElement.style.setProperty(CSS_VARIABLE_NAME, '240px');

    const { unmount } = renderHook(() =>
      useResizablePanel({
        side: 'right',
        constraints: { min: 200, max: 400, default: 240 },
        currentSize: 240,
        onSizeChange: jest.fn(),
        cssVariableName: CSS_VARIABLE_NAME,
      }),
    );

    unmount();

    expect(
      document.documentElement.style.getPropertyValue(CSS_VARIABLE_NAME),
    ).toBe('240px');
  });
});
