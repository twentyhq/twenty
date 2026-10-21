import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';

import { DateInput } from '@/ui/field/input/components/DateInput';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { DEFAULT_GLOBAL_HOTKEYS_CONFIG } from '@/ui/utilities/hotkey/constants/DefaultGlobalHotkeysConfig';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const DATE_INPUT_INSTANCE_ID = 'date-input';

const renderDateInput = () => {
  const onEnter = jest.fn();
  const onChange = jest.fn();
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(focusStackState.atom, [
        {
          focusId: DATE_INPUT_INSTANCE_ID,
          componentInstance: {
            componentType: FocusComponentType.OPENED_FIELD_INPUT,
            componentInstanceId: DATE_INPUT_INSTANCE_ID,
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
    <DateInput
      instanceId={DATE_INPUT_INSTANCE_ID}
      value="2026-01-15"
      onEnter={onEnter}
      onEscape={jest.fn()}
      onClickOutside={jest.fn()}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );

  return { onEnter, onChange };
};

describe('DateInput keyboard submission', () => {
  it.each([
    ['Next', '2026-02-15'],
    ['Previous', '2025-12-15'],
  ])(
    'pages the calendar with Enter on the %s button without submitting',
    async (buttonName, expectedDate) => {
      const user = userEvent.setup();
      const { onEnter, onChange } = renderDateInput();
      const pageButton = await screen.findByRole('button', {
        name: buttonName,
      });

      act(() => pageButton.focus());
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(expectedDate);
      expect(onEnter).not.toHaveBeenCalled();
    },
  );

  it('submits the date with Enter from the date text input', async () => {
    const user = userEvent.setup();
    const { onEnter } = renderDateInput();
    const calendar = await screen.findByRole('dialog', { name: 'Choose Date' });
    const dateTextInput = within(calendar).getByRole('textbox');

    act(() => dateTextInput.focus());
    await user.keyboard('{Enter}');

    expect(onEnter).toHaveBeenCalledWith('2026-01-15');
  });
});
