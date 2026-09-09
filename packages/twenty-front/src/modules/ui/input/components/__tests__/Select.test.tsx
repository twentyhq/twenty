import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { Select } from '@/ui/input/components/Select';

const renderSelect = (onChange = jest.fn()) => {
  const store = createStore();

  render(
    <JotaiProvider store={store}>
      <Select
        dropdownId="model-select-test"
        value="model-a"
        onChange={onChange}
        options={[
          {
            value: 'model-a',
            label: 'Model A',
            hoverCardContent: <div tabIndex={0}>Information about Model A</div>,
          },
          {
            value: 'model-b',
            label: 'Model B',
            hoverCardContent: <div>Information about Model B</div>,
          },
        ]}
      />
    </JotaiProvider>,
  );

  return { onChange };
};

describe('Select option hover cards', () => {
  it('hides information when the pointer leaves the option and popup', async () => {
    const user = userEvent.setup();
    renderSelect();
    await user.click(screen.getByRole('button'));
    const option = screen.getByRole('option', { name: 'Model B' });
    await user.hover(option);
    await screen.findByRole('tooltip');
    await user.unhover(option);
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });
  it('should show option information on hover without selecting the option', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();

    await user.click(screen.getByRole('button'));
    await user.hover(screen.getByRole('option', { name: 'Model B' }));

    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Information about Model B',
      ),
    );
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('option', { name: 'Model B' }));

    expect(onChange).toHaveBeenCalledWith('model-b');
  });

  it('keeps information available when the pointer enters the popup', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();

    await user.click(screen.getByRole('button'));
    await user.hover(screen.getByRole('option', { name: 'Model B' }));
    const tooltip = await screen.findByRole('tooltip');

    await user.hover(tooltip);
    expect(tooltip).toHaveTextContent('Information about Model B');
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{ArrowDown}{ArrowUp}');
    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Information about Model A',
      ),
    );
  });

  it('closes the selector and restores focus when Escape is pressed inside the popup', async () => {
    const user = userEvent.setup();
    renderSelect();
    const control = screen.getByRole('button');

    await user.click(control);
    await screen.findByText('Information about Model A');
    await user.tab();
    expect(screen.getByText('Information about Model A')).toHaveFocus();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(control).toHaveFocus();
  });

  it('should show information for the keyboard-focused option', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();

    await user.tab();

    expect(screen.getByRole('button')).toHaveFocus();

    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Information about Model A',
      ),
    );

    await user.keyboard('{ArrowDown}');

    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Information about Model B',
      ),
    );
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('model-b');
  });
});
