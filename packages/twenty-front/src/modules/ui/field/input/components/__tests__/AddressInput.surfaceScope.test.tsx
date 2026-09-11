import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';

import { AddressInput } from '@/ui/field/input/components/AddressInput';
import {
  WorkspaceSurfaceContext,
  type WorkspaceSurfaceContextValue,
} from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

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
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({});

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
      instanceId="address-input"
      value={EMPTY_ADDRESS}
      onTab={jest.fn()}
      onShiftTab={jest.fn()}
      onEnter={jest.fn()}
      onEscape={jest.fn()}
      onClickOutside={onClickOutside}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );

  return { onChange, onClickOutside };
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
});
