import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';

import { AddressInput } from '@/ui/field/input/components/AddressInput';
import {
  WorkspaceSurfaceContext,
  type WorkspaceSurfaceContextValue,
} from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { DEFAULT_GLOBAL_HOTKEYS_CONFIG } from '@/ui/utilities/hotkey/constants/DefaultGlobalHotkeysConfig';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const ADDRESS_INPUT_INSTANCE_ID = 'address-input';

const SIDE_PANEL_SURFACE: WorkspaceSurfaceContextValue = {
  type: 'side-panel',
  instanceId: 'side-panel-page',
  ownsRouteLocation: true,
};

const EMPTY_ADDRESS = {
  addressStreet1: '',
  addressStreet2: null,
  addressCity: null,
  addressState: null,
  addressCountry: null,
  addressPostcode: null,
  addressLat: null,
  addressLng: null,
};

const renderAddressInput = (surface?: WorkspaceSurfaceContextValue) => {
  const onChange = jest.fn();
  const onClickOutside = jest.fn();
  const onEnter = jest.fn();
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(focusStackState.atom, [
        {
          focusId: ADDRESS_INPUT_INSTANCE_ID,
          componentInstance: {
            componentType: FocusComponentType.OPENED_FIELD_INPUT,
            componentInstanceId: ADDRESS_INPUT_INSTANCE_ID,
          },
          globalHotkeysConfig: DEFAULT_GLOBAL_HOTKEYS_CONFIG,
        },
      ]);
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <BaseWrapper>
        {surface ? (
          <WorkspaceSurfaceContext.Provider value={surface}>
            {children}
          </WorkspaceSurfaceContext.Provider>
        ) : (
          children
        )}
      </BaseWrapper>
    </I18nProvider>
  );

  render(
    <AddressInput
      instanceId={ADDRESS_INPUT_INSTANCE_ID}
      value={EMPTY_ADDRESS}
      onTab={jest.fn()}
      onShiftTab={jest.fn()}
      onEnter={onEnter}
      onEscape={jest.fn()}
      onClickOutside={onClickOutside}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );

  return { onChange, onClickOutside, onEnter };
};

describe('AddressInput country picker on a side panel surface', () => {
  it.each([
    ['main', undefined],
    ['side-panel', SIDE_PANEL_SURFACE],
  ])('selects a country with a click on %s', async (_, surface) => {
    const user = userEvent.setup();
    const { onChange, onClickOutside } = renderAddressInput(surface);

    await user.click(screen.getByText('No country'));
    await user.type(screen.getByPlaceholderText('Search'), 'France');
    await user.click(await screen.findByText('France'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressCountry: 'France' }),
    );
    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it('opens the country picker with Enter without submitting the address editor', async () => {
    const user = userEvent.setup();
    const { onChange, onClickOutside, onEnter } =
      renderAddressInput(SIDE_PANEL_SURFACE);
    const trigger = screen.getByRole('button', { name: 'Country' });

    act(() => trigger.focus());
    await user.keyboard('{Enter}');

    expect(onEnter).not.toHaveBeenCalled();
    expect(
      await screen.findByRole('dialog', { name: 'Country' }),
    ).toBeVisible();

    await user.type(screen.getByPlaceholderText('Search'), 'France');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ addressCountry: 'France' }),
    );
    expect(onEnter).not.toHaveBeenCalled();
    expect(onClickOutside).not.toHaveBeenCalled();
  });
});
