import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';
import { Temporal } from 'temporal-polyfill';

import { DateTimeInput } from '@/ui/field/input/components/DateTimeInput';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { DEFAULT_GLOBAL_HOTKEYS_CONFIG } from '@/ui/utilities/hotkey/constants/DefaultGlobalHotkeysConfig';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const DATE_TIME_INPUT_INSTANCE_ID = 'date-time-input';

const renderDateTimeInput = () => {
  const onEnter = jest.fn();
  const onChange = jest.fn();
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(focusStackState.atom, [
        {
          focusId: DATE_TIME_INPUT_INSTANCE_ID,
          componentInstance: {
            componentType: FocusComponentType.OPENED_FIELD_INPUT,
            componentInstanceId: DATE_TIME_INPUT_INSTANCE_ID,
          },
          globalHotkeysConfig: DEFAULT_GLOBAL_HOTKEYS_CONFIG,
        },
      ]);
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <BaseWrapper>{children}</BaseWrapper>
    </I18nProvider>
  );

  render(
    <DateTimeInput
      instanceId={DATE_TIME_INPUT_INSTANCE_ID}
      value={Temporal.Instant.from('2026-01-15T10:00:00Z')}
      onEnter={onEnter}
      onEscape={jest.fn()}
      onClickOutside={jest.fn()}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );

  return { onEnter, onChange };
};

describe('DateTimeInput keyboard submission', () => {
  it.each([
    ['Next', '2026-02-15T10:00:00Z'],
    ['Previous', '2025-12-15T10:00:00Z'],
  ])(
    'pages the calendar with Enter on the %s button without submitting',
    async (buttonName, expectedInstant) => {
      const user = userEvent.setup();
      const { onEnter, onChange } = renderDateTimeInput();
      const pageButton = await screen.findByRole('button', {
        name: buttonName,
      });

      act(() => pageButton.focus());
      await user.keyboard('{Enter}');

      expect(onChange.mock.lastCall?.[0]?.toString()).toBe(expectedInstant);
      expect(onEnter).not.toHaveBeenCalled();
    },
  );

  it('opens the month and year panel with Enter without submitting', async () => {
    const user = userEvent.setup();
    const { onEnter } = renderDateTimeInput();
    const monthYearTrigger = await screen.findByRole('button', {
      name: 'Select month and year',
    });

    act(() => monthYearTrigger.focus());
    await user.keyboard('{Enter}');

    expect(monthYearTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('January')).toBeVisible();
    expect(onEnter).not.toHaveBeenCalled();
  });

  it('submits the date with Enter from the time input', async () => {
    const user = userEvent.setup();
    const { onEnter } = renderDateTimeInput();
    const timeInput = await screen.findByPlaceholderText(/HH:mm/);

    act(() => timeInput.focus());
    await user.keyboard('{Enter}');

    expect(onEnter.mock.lastCall?.[0]?.toString()).toBe('2026-01-15T10:00:00Z');
  });
});
