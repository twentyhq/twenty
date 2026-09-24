import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { Key } from 'ts-key-enum';

const GlobalHotkeyEffect = ({
  hotkey,
  onHotkey,
}: {
  hotkey: string;
  onHotkey: () => void;
}) => {
  useGlobalHotkeys({
    keys: [hotkey],
    callback: onHotkey,
    containsModifier: false,
    dependencies: [onHotkey],
    options: {
      eventListenerOptions: {
        capture: true,
      },
      preventDefault: false,
    },
  });

  return null;
};

const renderWithGlobalHotkey = ({
  hotkey = Key.Escape,
  field,
}: {
  hotkey?: string;
  field: ReactNode;
}) => {
  const onHotkey = jest.fn();

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <GlobalHotkeyEffect hotkey={hotkey} onHotkey={onHotkey} />
        {field}
      </Provider>
    </I18nProvider>,
  );

  return { onHotkey };
};

it('lets Escape pressed in a form field reach global Escape hotkeys', async () => {
  const user = userEvent.setup();
  const { onHotkey } = renderWithGlobalHotkey({
    field: <FormNumberFieldInput defaultValue={1} onChange={jest.fn()} />,
  });
  await user.click(screen.getByDisplayValue('1'));

  await user.keyboard('{Escape}');

  expect(onHotkey).toHaveBeenCalledTimes(1);
});

it('keeps other global hotkeys without modifier off while typing in a form field', async () => {
  const user = userEvent.setup();
  const { onHotkey } = renderWithGlobalHotkey({
    hotkey: 'a',
    field: <FormNumberFieldInput defaultValue={1} onChange={jest.fn()} />,
  });
  await user.click(screen.getByDisplayValue('1'));

  await user.keyboard('a');

  expect(onHotkey).not.toHaveBeenCalled();
});

it('gives Escape to an open dropdown instead of global Escape hotkeys', async () => {
  const user = userEvent.setup();
  const { onHotkey } = renderWithGlobalHotkey({
    field: (
      <FormSelectFieldInput
        label="Stage"
        defaultValue="a"
        onChange={jest.fn()}
        options={[
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ]}
      />
    ),
  });
  await user.click(screen.getByText('Option A'));
  expect(await screen.findByText('Option B')).toBeInTheDocument();

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByText('Option B')).not.toBeInTheDocument(),
  );
  expect(onHotkey).not.toHaveBeenCalled();
});

it('gives Escape to an open date picker instead of global Escape hotkeys', async () => {
  const user = userEvent.setup();
  const { onHotkey } = renderWithGlobalHotkey({
    field: <FormDateFieldInput defaultValue={undefined} onChange={jest.fn()} />,
  });
  await user.click(screen.getByRole('textbox'));
  expect(await screen.findByText('Clear')).toBeInTheDocument();

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByText('Clear')).not.toBeInTheDocument(),
  );
  expect(onHotkey).not.toHaveBeenCalled();
});
