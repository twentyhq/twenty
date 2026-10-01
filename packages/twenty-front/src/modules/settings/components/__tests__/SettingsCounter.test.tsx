import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useState } from 'react';

import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const RetentionCounter = ({
  onChange,
  showButtons = false,
}: {
  onChange: (value: number) => void;
  showButtons?: boolean;
}) => {
  const [value, setValue] = useState(90);

  return (
    <SettingsOptionCardContentCounter
      title="Log retention"
      description="Number of days to retain audit logs"
      value={value}
      onChange={(nextValue) => {
        onChange(nextValue);
        setValue(nextValue);
      }}
      minValue={30}
      maxValue={1095}
      showButtons={showButtons}
    />
  );
};

it('associates settings copy and preserves the minimum when clearing once', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  render(
    <JotaiProvider store={createStore()}>
      <RetentionCounter onChange={onChange} />
    </JotaiProvider>,
  );

  const input = screen.getByRole('textbox', { name: 'Log retention' });

  expect(input).toHaveAccessibleDescription(
    'Number of days to retain audit logs',
  );

  await user.clear(input);

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(30);

  await user.tab();

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(30);
  expect(input).toHaveValue('30');
});

it('ignores below-minimum drafts and persists valid retention edits immediately', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  render(
    <JotaiProvider store={createStore()}>
      <RetentionCounter onChange={onChange} />
    </JotaiProvider>,
  );

  const input = screen.getByRole('textbox', { name: 'Log retention' });

  await user.tripleClick(input);
  await user.keyboard('6');

  expect(input).toHaveValue('6');
  expect(onChange).not.toHaveBeenCalled();

  await user.keyboard('0');

  expect(input).toHaveValue('60');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(60);

  await user.tab();

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(60);
  expect(input).toHaveValue('60');
});

it('restores the saved value when a below-minimum draft loses focus', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  render(
    <JotaiProvider store={createStore()}>
      <RetentionCounter onChange={onChange} />
    </JotaiProvider>,
  );

  const input = screen.getByRole('textbox', { name: 'Log retention' });

  await user.tripleClick(input);
  await user.keyboard('4');
  await user.tab();

  expect(input).toHaveValue('90');
  expect(onChange).not.toHaveBeenCalled();
});

it('clamps a pasted retention value to the maximum exactly once', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  render(
    <JotaiProvider store={createStore()}>
      <RetentionCounter onChange={onChange} />
    </JotaiProvider>,
  );

  const input = screen.getByRole('textbox', { name: 'Log retention' });

  await user.tripleClick(input);
  await user.paste('2000');

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(1095);

  await user.tab();

  expect(input).toHaveValue('1095');
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('persists each pointer and keyboard adjustment once', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  render(
    <JotaiProvider store={createStore()}>
      <RetentionCounter onChange={onChange} showButtons />
    </JotaiProvider>,
  );

  const input = screen.getByRole('textbox', { name: 'Log retention' });

  await user.click(screen.getByRole('button', { name: 'Increase value' }));

  expect(input).toHaveValue('91');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenLastCalledWith(91);

  await user.click(input);
  await user.keyboard('{ArrowDown}');
  await user.tab();

  expect(input).toHaveValue('90');
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenLastCalledWith(90);
});

it('restores an already saved minimum without persisting another change', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  render(
    <JotaiProvider store={createStore()}>
      <SettingsOptionCardContentCounter
        title="Log retention"
        value={30}
        onChange={onChange}
        minValue={30}
        maxValue={1095}
        showButtons={false}
      />
    </JotaiProvider>,
  );

  const input = screen.getByRole('textbox', { name: 'Log retention' });

  await user.clear(input);
  await user.tab();

  expect(input).toHaveValue('30');
  expect(onChange).not.toHaveBeenCalled();
});

it('isolates input focus and restores global hotkeys when Escape blurs it', async () => {
  const store = createStore();
  const onChange = jest.fn();
  const user = userEvent.setup();

  render(
    <JotaiProvider store={store}>
      <SettingsOptionCardContentCounter
        title="Timeout"
        value={45}
        onChange={onChange}
        minValue={1}
        maxValue={900}
        showButtons={false}
      />
      <SettingsOptionCardContentCounter
        title="Maximum values"
        value={3}
        onChange={onChange}
        minValue={1}
        showButtons={false}
      />
    </JotaiProvider>,
  );

  const timeoutInput = screen.getByRole('textbox', { name: 'Timeout' });
  const maximumValuesInput = screen.getByRole('textbox', {
    name: 'Maximum values',
  });

  await user.click(timeoutInput);

  const timeoutFocusItem = store.get(focusStackState.atom).at(-1);

  expect(timeoutFocusItem).toMatchObject({
    componentInstance: { componentType: FocusComponentType.TEXT_INPUT },
    globalHotkeysConfig: {
      enableGlobalHotkeysConflictingWithKeyboard: false,
    },
  });

  await user.click(maximumValuesInput);

  expect(store.get(focusStackState.atom)).toHaveLength(1);
  expect(store.get(focusStackState.atom).at(-1)?.focusId).not.toBe(
    timeoutFocusItem?.focusId,
  );

  await user.keyboard('{Escape}');

  expect(maximumValuesInput).not.toHaveFocus();
  expect(store.get(focusStackState.atom)).toHaveLength(0);
  expect(onChange).not.toHaveBeenCalled();
});
