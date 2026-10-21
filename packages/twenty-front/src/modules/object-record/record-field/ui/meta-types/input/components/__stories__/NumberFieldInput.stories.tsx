import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useNumberField } from '@/object-record/record-field/ui/meta-types/hooks/useNumberField';
import { NumberFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/NumberFieldInput';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldNumberMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

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
  settings?: FieldNumberMetadata['settings'];
};

const NumberFieldInputWithContext = ({
  recordId,
  value,
  settings,
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
              settings,
            },
          },
          recordId: '123',
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <NumberFieldValueSetterEffect value={value} />
          <NumberFieldInput />
        </FieldInputEventContextProviderWithJestMocks>
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
  decorators: [clearMocksDecorator, ToastDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof NumberFieldInputWithContext>;

export const Default: Story = {};

export const Percentage: Story = {
  args: {
    settings: { type: 'percentage' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const suffix = await canvas.findByText('%');
    expect(suffix).toBeVisible();

    const input = canvas.getByRole('textbox');
    await userEvent.type(input, '45%');

    expect(input).toHaveValue('45');

    await userEvent.click(suffix);

    expect(handleClickoutsideMocked).not.toHaveBeenCalled();

    await userEvent.clear(input);
    await userEvent.paste('25.5%');

    expect(input).toHaveValue('25.5');
  },
};

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
