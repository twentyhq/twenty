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
            hoverCardContent: <div>Information about Model A</div>,
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
