import { useEffect } from 'react';
import { expect, jest } from '@storybook/jest';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';

import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useDoubleTextChipField } from '../../../hooks/useDoubleTextChipField';
import {
  DoubleTextChipFieldInput,
  DoubleTextChipFieldInputProps,
} from '../DoubleTextChipFieldInput';

const DoubleTextChipFieldValueSetterEffect = ({
  firstValue,
  secondValue,
}: {
  firstValue: string;
  secondValue: string;
}) => {
  const { setFirstValue, setSecondValue } = useDoubleTextChipField();

  useEffect(() => {
    setFirstValue(firstValue);
    setSecondValue(secondValue);
  }, [firstValue, secondValue, setFirstValue, setSecondValue]);

  return <></>;
};

type DoubleTextChipFieldInputWithContextProps =
  DoubleTextChipFieldInputProps & {
    firstValue: string;
    secondValue: string;
    entityId?: string;
  };

const DoubleTextChipFieldInputWithContext = ({
  entityId,
  firstValue,
  secondValue,
  onClickOutside,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
}: DoubleTextChipFieldInputWithContextProps) => {
  const setHotKeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotKeyScope('hotkey-scope');
  }, [setHotKeyScope]);

  return (
    <div>
      <FieldContextProvider
        fieldDefinition={{
          key: 'double-text-chip',
          name: 'Double-Text-Chip',
          type: 'double-text-chip',
          metadata: {
            firstValueFieldName: 'First-text',
            firstValuePlaceholder: 'First-text',
            secondValueFieldName: 'Second-text',
            secondValuePlaceholder: 'Second-text',
            avatarUrlFieldName: 'avatarUrl',
            entityType: Entity.Person,
          },
        }}
        entityId={entityId}
      >
        <DoubleTextChipFieldValueSetterEffect
          {...{ firstValue, secondValue }}
        />
        <DoubleTextChipFieldInput
          {...{ onEnter, onEscape, onClickOutside, onTab, onShiftTab }}
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
  title: 'UI/Field/Input/DoubleTextChipFieldInput',
  component: DoubleTextChipFieldInputWithContext,
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
  parameters: {
    clearMocks: true,
  },
  decorators: [clearMocksDecorator],
};

export default meta;

type Story = StoryObj<typeof DoubleTextChipFieldInputWithContext>;

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

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');

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
