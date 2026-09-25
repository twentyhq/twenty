import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemDividerDisplay } from '@/navigation-menu-item/display/divider/components/NavigationMenuItemDividerDisplay';

const DIVIDER_ITEM = { id: 'divider-id', folderId: null };

const renderDivider = ({
  isLayoutCustomizationModeEnabled,
  onEditModeClick,
}: {
  isLayoutCustomizationModeEnabled: boolean;
  onEditModeClick: () => void;
}) => {
  const store = createStore();
  store.set(
    isLayoutCustomizationModeEnabledState.atom,
    isLayoutCustomizationModeEnabled,
  );

  render(
    <Provider store={store}>
      <NavigationMenuItemDividerDisplay
        item={DIVIDER_ITEM}
        onEditModeClick={onEditModeClick}
      />
    </Provider>,
  );
};

describe('NavigationMenuItemDividerDisplay', () => {
  it('is an inert separator outside layout customization', async () => {
    const onEditModeClick = jest.fn();
    renderDivider({ isLayoutCustomizationModeEnabled: false, onEditModeClick });

    await userEvent.click(screen.getByRole('separator'));

    expect(onEditModeClick).not.toHaveBeenCalled();
  });

  it('can be selected during layout customization', async () => {
    const onEditModeClick = jest.fn();
    renderDivider({ isLayoutCustomizationModeEnabled: true, onEditModeClick });

    await userEvent.click(screen.getByRole('separator'));

    expect(onEditModeClick).toHaveBeenCalledTimes(1);
  });
});
