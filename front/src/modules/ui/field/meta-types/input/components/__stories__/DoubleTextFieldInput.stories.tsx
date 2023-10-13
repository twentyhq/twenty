import { useEffect } from 'react';
import { expect, jest } from '@storybook/jest';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useDoubleTextField } from '../../../hooks/useDoubleTextField';
import {
  DoubleTextFieldInput,
  DoubleTextFieldInputProps,
} from '../DoubleTextFieldInput';

const DoubleTextFieldValueSetterEffect = ({
  firstValue,
  secondValue,
}: {
  firstValue: string;
  secondValue: string;
}) => {
  const { setFirstValue, setSecondValue } = useDoubleTextField();

  useEffect(() => {
    setFirstValue(firstValue);
    setSecondValue(secondValue);
  }, [firstValue, secondValue, setFirstValue, setSecondValue]);

  return <></>;
};

type DoubleTextFieldInputWithContextProps = DoubleTextFieldInputProps & {
  firstValue: string;
  secondValue: string;
  entityId?: string;
};

const DoubleTextFieldInputWithContext = ({
  entityId,
  firstValue,
  secondValue,
  onClickOutside,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
}: DoubleTextFieldInputWithContextProps) => {
  const setHotKeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotKeyScope('hotkey-scope');
  }, [setHotKeyScope]);

  return (
    <div>
      <FieldContextProvider
        fieldDefinition={{
          key: 'double-text',
          name: 'Double-Text',
          type: 'double-text',
          metadata: {
            firstValueFieldName: 'First-text',
            firstValuePlaceholder: 'First-text',
            secondValueFieldName: 'Second-text',
            secondValuePlaceholder: 'Second-text',
          },
        }}
        entityId={entityId}
      >
        <DoubleTextFieldValueSetterEffect {...{ firstValue, secondValue }} />
        <DoubleTextFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      </FieldContextProvider>
      <div data-testid="data-field-input-click-outside-div" />
    </div>
  );
};

const enterJestFn = jest.fn();
const escapeJestfn = jest.fn();
const clickOutsideJestFn = jest.fn();
const tabJestFn = jest.fn();
const shiftTabJestFn = jest.fn();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks) {
    enterJestFn.mockClear();
    escapeJestfn.mockClear();
    clickOutsideJestFn.mockClear();
    tabJestFn.mockClear();
    shiftTabJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Field/Input/DoubleTextFieldInput',
  component: DoubleTextFieldInputWithContext,
  args: {
    firstValue: 'first value',
    secondValue: 'second value',
    onEnter: enterJestFn,
    onEscape: escapeJestfn,
    onClickOutside: clickOutsideJestFn,
    onTab: tabJestFn,
    onShiftTab: shiftTabJestFn,
  },
  argTypes: {
    onEnter: { control: false },
    onEscape: { control: false },
    onClickOutside: { control: false },
    onTab: { control: false },
    onShiftTab: { control: false },
  },
  decorators: [clearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof DoubleTextFieldInputWithContext>;

export const Default: Story = {};

export const Enter: Story = {
  play: async () => {
    expect(enterJestFn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{enter}');
      expect(enterJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Escape: Story = {
  play: async () => {
    expect(escapeJestfn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{esc}');
      expect(escapeJestfn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const emptyDiv = await canvas.findByTestId(
      'data-field-input-click-outside-div',
    );

    await waitFor(() => {
      userEvent.click(emptyDiv);
      expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Tab: Story = {
  play: async () => {
    expect(tabJestFn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{tab}');
      expect(tabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ShiftTab: Story = {
  play: async () => {
    expect(shiftTabJestFn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      userEvent.keyboard('{shift>}{tab}');
      expect(shiftTabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
