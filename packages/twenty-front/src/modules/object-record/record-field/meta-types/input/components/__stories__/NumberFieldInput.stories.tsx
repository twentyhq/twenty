import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect, useState } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { StorybookFieldInputDropdownFocusIdSetterEffect } from '~/testing/components/StorybookFieldInputDropdownFocusIdSetterEffect';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { useNumberField } from '../../../hooks/useNumberField';
import { NumberFieldInput, NumberFieldInputProps } from '../NumberFieldInput';

const NumberFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useNumberField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type NumberFieldInputWithContextProps = NumberFieldInputProps & {
  value: number;
  recordId: string;
};

const NumberFieldInputWithContext = ({
  recordId,
  value,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: NumberFieldInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const [isReady, setIsReady] = useState(false);

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'Number',
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  useEffect(() => {
    if (!isReady) {
      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.OPENED_FIELD_INPUT,
          instanceId: instanceId,
        },
      });
      setIsReady(true);
    }
  }, [isReady, pushFocusItemToFocusStack, instanceId]);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputInstanceId({
          recordId,
          fieldName: 'Number',
          prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
        }),
      }}
    >
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            fieldMetadataId: 'number',
            label: 'Number',
            iconName: 'Icon123',
            type: FieldMetadataType.NUMBER,
            metadata: {
              fieldName: 'number',
              placeHolder: 'Enter number',
              objectMetadataNameSingular: 'person',
            },
          },
          recordId: '123',
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        {isReady && <StorybookFieldInputDropdownFocusIdSetterEffect />}
        <NumberFieldValueSetterEffect value={value} />
        <NumberFieldInput
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
  title: 'UI/Data/Field/Input/NumberFieldInput',
  component: NumberFieldInputWithContext,
  args: {
    value: 1000,
    isPositive: true,
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

type Story = StoryObj<typeof NumberFieldInputWithContext>;

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
      expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Tab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(tabJestFn).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{tab}');

    await waitFor(() => {
      expect(tabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ShiftTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(shiftTabJestFn).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{shift>}{tab}');

    await waitFor(() => {
      expect(shiftTabJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
