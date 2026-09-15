import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { AdvancedSettingsSwitch } from '@/ui/input/components/AdvancedSettingsSwitch';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

const originalPointerEvent = window.PointerEvent;

// Base UI dispatches a PointerEvent when forwarding switch clicks to its input.
beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: MouseEvent,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: originalPointerEvent,
  });
});

const CompactAdvancedSettingsSwitch = () => {
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useState(false);

  return (
    <AdvancedSettingsSwitch
      compact
      label="Advanced"
      isAdvancedModeEnabled={isAdvancedModeEnabled}
      setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
    />
  );
};

it('keeps the compact Advanced switch named and operable', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider i18n={i18n}>
      <CompactAdvancedSettingsSwitch />
    </I18nProvider>,
  );
  const advancedSwitch = screen.getByRole('switch', { name: 'Advanced' });

  expect(advancedSwitch).not.toBeChecked();
  await user.click(advancedSwitch);
  expect(advancedSwitch).toBeChecked();
  await user.keyboard(' ');
  expect(advancedSwitch).not.toBeChecked();
});
