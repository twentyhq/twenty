import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { SidePanelTopBarEscapeHotkeyEffect } from '@/side-panel/components/SidePanelTopBarEscapeHotkeyEffect';

describe('SidePanelTopBarEscapeHotkeyEffect', () => {
  it('handles Escape only when the search input is not focused', async () => {
    const inputRef = createRef<HTMLInputElement>();
    const handleEscape = jest.fn();

    render(
      <>
        <input aria-label="Search" ref={inputRef} />
        <button type="button">Outside</button>
        <SidePanelTopBarEscapeHotkeyEffect
          inputRef={inputRef}
          onEscape={handleEscape}
        />
      </>,
    );

    const input = screen.getByRole('textbox', { name: 'Search' });
    const outsideButton = screen.getByRole('button', { name: 'Outside' });

    await userEvent.click(input);
    await userEvent.keyboard('{Escape}');

    expect(handleEscape).not.toHaveBeenCalled();

    await userEvent.click(outsideButton);
    await userEvent.keyboard('{Escape}');

    expect(handleEscape).toHaveBeenCalledTimes(1);
  });
});
