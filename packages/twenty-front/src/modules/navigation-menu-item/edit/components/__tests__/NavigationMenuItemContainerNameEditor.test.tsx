import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';

const mockUpdateItem = jest.fn();

jest.mock(
  '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController',
  () => ({
    useNavigationMenuItemEditController: () => ({
      updateItem: mockUpdateItem,
    }),
  }),
);

describe('NavigationMenuItemContainerNameEditor', () => {
  beforeEach(() => {
    mockUpdateItem.mockClear();
  });

  it('keeps the last non-empty name when the field is cleared', async () => {
    const user = userEvent.setup();

    render(
      <JotaiProvider store={createStore()}>
        <NavigationMenuItemContainerNameEditor
          item={{ id: 'sales-section-id', name: 'Sales', icon: null }}
          placeholder="Section name"
          onSubmit={jest.fn()}
        />
      </JotaiProvider>,
    );

    const input = screen.getByRole('textbox', { name: 'Section name' });

    await user.clear(input);
    await user.type(input, 'Deals');
    await user.clear(input);

    expect(mockUpdateItem).toHaveBeenLastCalledWith('sales-section-id', {
      name: 'Deals',
    });
    expect(mockUpdateItem).not.toHaveBeenCalledWith('sales-section-id', {
      name: 'Sales',
    });
  });
});
