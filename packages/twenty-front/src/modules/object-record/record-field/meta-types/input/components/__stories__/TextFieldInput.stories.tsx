import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect, useState } from 'react';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { FieldMetadataType } from '~/generated/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { useTextField } from '../../../hooks/useTextField';
import { TextFieldInput, TextFieldInputProps } from '../TextFieldInput';

const TextFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useTextField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type TextFieldInputWithContextProps = TextFieldInputProps & {
  value: string;
  recordId?: string;
};

const TextFieldInputWithContext = ({
  recordId,
  value,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: TextFieldInputWithContextProps) => {
  const setHotKeyScope = useSetHotkeyScope();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) {
      setHotKeyScope(DEFAULT_CELL_SCOPE.scope);
      setIsReady(true);
    }
  }, [isReady, setHotKeyScope]);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: 'record-field-component-instance-id',
      }}
    >
      <FieldContext.Provider
        value={{
          recordId: recordId ?? '123',
          fieldDefinition: {
            fieldMetadataId: 'text',
            label: 'Text',
            type: FieldMetadataType.TEXT,
            iconName: 'IconText',
            metadata: {
              fieldName: 'text',
              objectMetadataNameSingular: 'person',
              placeHolder: 'Enter text',
            },
          },
          isLabelIdentifier: false,
          isReadOnly: false,
        }}
      >
        <TextFieldValueSetterEffect value={value} />
        <TextFieldInput
          onEnter={onEnter}
          onEscape={onEscape}
          onClickOutside={onClickOutside}
          onTab={onTab}
          onShiftTab={onShiftTab}
        />
      </FieldContext.Provider>
      {isReady && <div data-testid="is-ready-marker" />}
      <div data-testid="data-field-input-click-outside-div" />
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const enterJestFn = fn();
const escapeJestfn = fn();
const clickOutsideJestFn = fn();
const tabJestFn = fn();
const shiftTabJestFn = fn();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    enterJestFn.mockClear();
    escapeJestfn.mockClear();
    clickOutsideJestFn.mockClear();
    tabJestFn.mockClear();
    shiftTabJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/TextFieldInput',
  component: TextFieldInputWithContext,
  args: {
    value: 'text',
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
  decorators: [clearMocksDecorator, SnackBarDecorator, I18nFrontDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof TextFieldInputWithContext>;

export const Default: Story = {};

export const Enter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(enterJestFn).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(enterJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Escape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(escapeJestfn).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{esc}');

    await waitFor(() => {
      expect(escapeJestfn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');
    await canvas.findByTestId('is-ready-marker');

    await userEvent.click(emptyDiv);

    await waitFor(() => {
      expect(clickOutsideJestFn).toHaveBeenCalled();
    });
  },
};

export const Tab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    expect(tabJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{tab}');

    await waitFor(() => {
      expect(tabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ShiftTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    expect(shiftTabJestFn).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{shift>}{tab}');

    await waitFor(() => {
      expect(shiftTabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
