import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useEffect, useState } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';
import { TextFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/TextFieldInput';

const TextFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useTextField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEscapeMocked,
  handleClickoutsideMocked,
  handleEnterMocked,
  handleShiftTabMocked,
  handleTabMocked,
} = getFieldInputEventContextProviderWithJestMocks();

type TextFieldInputWithContextProps = {
  value: string;
  recordId: string;
};

const TextFieldInputWithContext = ({
  recordId,
  value,
}: TextFieldInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const [isReady, setIsReady] = useState(false);

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'Text',
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
        instanceId: instanceId,
      }}
    >
      <FieldContext.Provider
        value={{
          recordId,
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
          isRecordFieldReadOnly: false,
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <TextFieldValueSetterEffect value={value} />
          <TextFieldInput />
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
  title: 'UI/Data/Field/Input/TextFieldInput',
  component: TextFieldInputWithContext,
  args: {
    value: 'text',
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

type Story = StoryObj<typeof TextFieldInputWithContext>;

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
      expect(handleClickoutsideMocked).toHaveBeenCalled();
    });
  },
};

export const Tab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    expect(handleTabMocked).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{tab}');

    await waitFor(() => {
      expect(handleTabMocked).toHaveBeenCalledTimes(1);
    });
  },
};

export const ShiftTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    expect(handleShiftTabMocked).toHaveBeenCalledTimes(0);

    await userEvent.keyboard('{shift>}{tab}');

    await waitFor(() => {
      expect(handleShiftTabMocked).toHaveBeenCalledTimes(1);
    });
  },
};
