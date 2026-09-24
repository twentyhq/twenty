import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { SidePanelTopBarEscapeHotkeyEffect } from '@/side-panel/components/SidePanelTopBarEscapeHotkeyEffect';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useRef, useState } from 'react';

const LetterHotkeyEffect = ({ onHotkey }: { onHotkey: () => void }) => {
  useGlobalHotkeys({
    keys: ['a'],
    callback: onHotkey,
    containsModifier: false,
    dependencies: [onHotkey],
  });

  return null;
};

const SidePanel = ({
  onEscape,
  onLetterHotkey,
  children,
}: {
  onEscape: () => void;
  onLetterHotkey: () => void;
  children: ReactNode;
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleEscape = () => {
    onEscape();
    setIsOpen(false);
  };

  return (
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <SidePanelTopBarEscapeHotkeyEffect
          inputRef={searchInputRef}
          onEscape={handleEscape}
        />
        <LetterHotkeyEffect onHotkey={onLetterHotkey} />
        {isOpen ? children : null}
      </Provider>
    </I18nProvider>
  );
};

const renderInSidePanel = (field: ReactNode) => {
  const onEscape = jest.fn();
  const onLetterHotkey = jest.fn();

  render(
    <SidePanel onEscape={onEscape} onLetterHotkey={onLetterHotkey}>
      {field}
    </SidePanel>,
  );

  return { onEscape, onLetterHotkey };
};

it('closes the side panel when Escape is pressed in a form field', async () => {
  const user = userEvent.setup();
  const { onEscape } = renderInSidePanel(
    <FormNumberFieldInput defaultValue={1} onChange={jest.fn()} />,
  );
  await user.click(screen.getByDisplayValue('1'));

  await user.keyboard('{Escape}');

  expect(onEscape).toHaveBeenCalledTimes(1);
  expect(screen.queryByDisplayValue('1')).not.toBeInTheDocument();
});

it('keeps letter hotkeys off while a form field is focused and restores them once Escape leaves it', async () => {
  const user = userEvent.setup();
  const { onLetterHotkey } = renderInSidePanel(
    <FormNumberFieldInput defaultValue={1} onChange={jest.fn()} />,
  );
  await user.click(screen.getByDisplayValue('1'));

  await user.keyboard('a');
  expect(onLetterHotkey).not.toHaveBeenCalled();

  await user.keyboard('{Escape}');
  await user.keyboard('a');

  expect(onLetterHotkey).toHaveBeenCalledTimes(1);
});

it('keeps Escape for an input method that is composing text', async () => {
  const user = userEvent.setup();
  const { onEscape } = renderInSidePanel(
    <FormNumberFieldInput defaultValue={1} onChange={jest.fn()} />,
  );
  const input = screen.getByDisplayValue('1');
  await user.click(input);

  fireEvent.keyDown(input, { key: 'Escape', isComposing: true });

  expect(onEscape).not.toHaveBeenCalled();
  expect(input).toBeInTheDocument();
});

it('gives Escape to an open dropdown before the side panel', async () => {
  const user = userEvent.setup();
  const { onEscape } = renderInSidePanel(
    <FormSelectFieldInput
      label="Stage"
      defaultValue="a"
      onChange={jest.fn()}
      options={[
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ]}
    />,
  );
  await user.click(screen.getByText('Option A'));
  expect(await screen.findByText('Option B')).toBeInTheDocument();

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByText('Option B')).not.toBeInTheDocument(),
  );
  expect(onEscape).not.toHaveBeenCalled();
});

it('gives Escape to an open date picker before the side panel', async () => {
  const user = userEvent.setup();
  const { onEscape } = renderInSidePanel(
    <FormDateFieldInput defaultValue={undefined} onChange={jest.fn()} />,
  );
  await user.click(screen.getByRole('textbox'));
  expect(await screen.findByText('Clear')).toBeInTheDocument();

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByText('Clear')).not.toBeInTheDocument(),
  );
  expect(onEscape).not.toHaveBeenCalled();
});
