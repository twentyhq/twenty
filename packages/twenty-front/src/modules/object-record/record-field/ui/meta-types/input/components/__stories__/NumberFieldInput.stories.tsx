import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useEffect, useState } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { StorybookFieldInputDropdownFocusIdSetterEffect } from '~/testing/components/StorybookFieldInputDropdownFocusIdSetterEffect';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { useNumberField } from '@/object-record/record-field/ui/meta-types/hooks/useNumberField';
import { NumberFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/NumberFieldInput';

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEnterMocked,
  handleEscapeMocked,
  handleClickoutsideMocked,
  handleTabMocked,
  handleShiftTabMocked,
} = getFieldInputEventContextProviderWithJestMocks();

const NumberFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useNumberField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type NumberFieldInputWithContextProps = {
  value: number;
  recordId: string;
};

const NumberFieldInputWithContext = ({
  recordId,
  value,
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
        <RecordFieldsScopeContextProvider
          value={{ scopeInstanceId: RECORD_TABLE_CELL_INPUT_ID_PREFIX }}
        >
          <FieldInputEventContextProviderWithJestMocks>
            {isReady && <StorybookFieldInputDropdownFocusIdSetterEffect />}
            <NumberFieldValueSetterEffect value={value} />
            <NumberFieldInput />
          </FieldInputEventContextProviderWithJestMocks>
        </RecordFieldsScopeContextProvider>
      </FieldContext.Provider>
      {isReady && <div data-testid="is-ready-marker" />}
      <div data-testid="data-field-input-click-outside-div" />
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleEnterMocked.mockClear();
    handleEscapeMocked.mockClear();
    handleClickoutsideMocked.mockClear();
    handleTabMocked.mockClear();
    handleShiftTabMocked.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/NumberFieldInput',
  component: NumberFieldInputWithContext,
  args: {
    value: 1000,
    isPositive: true,
    onEnter: handleEnterMocked,
    onEscape: handleEscapeMocked,
    onClickOutside: handleClickoutsideMocked,
    onTab: handleTabMocked,
    onShiftTab: handleShiftTabMocked,
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

    expect(handleEnterMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(handleEnterMocked).toHaveBeenCalledTimes(1);
    });
  },
};

export const Escape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleEscapeMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{esc}');

    await waitFor(() => {
      expect(handleEscapeMocked).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleClickoutsideMocked).toHaveBeenCalledTimes(0);

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');

    await canvas.findByTestId('is-ready-marker');
    await userEvent.click(emptyDiv);

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledTimes(1);
    });
  },
};

export const Tab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleTabMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{tab}');

    await waitFor(() => {
      expect(handleTabMocked).toHaveBeenCalledTimes(1);
    });
  },
};

export const ShiftTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleShiftTabMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('is-ready-marker');
    await userEvent.keyboard('{shift>}{tab}');

    await waitFor(() => {
      expect(handleShiftTabMocked).toHaveBeenCalledTimes(1);
    });
  },
};
