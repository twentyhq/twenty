import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { RichTextFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RichTextFieldInput';
import { getFieldInputEventContextProviderWithJestMocks } from './utils/getFieldInputEventContextProviderWithJestMocks';

const targetableObjectId = 'test-id';

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEscapeMocked,
  handleClickoutsideMocked,
} = getFieldInputEventContextProviderWithJestMocks();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks !== false) {
    handleClickoutsideMocked.mockClear();
    handleEscapeMocked.mockClear();
  }
  return <Story />;
};

const RichTextFieldInputWithContext = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const instanceId = getRecordFieldInputInstanceId({
    recordId: targetableObjectId,
    fieldName: 'richText',
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId: instanceId,
      },
    });
  }, [pushFocusItemToFocusStack, instanceId]);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: instanceId,
      }}
    >
      <FieldContext.Provider
        value={{
          recordId: targetableObjectId,
          fieldDefinition: {
            fieldMetadataId: 'richText',
            label: 'Rich Text',
            type: FieldMetadataType.RICH_TEXT,
            iconName: 'IconRichText',
            metadata: {
              fieldName: 'richText',
              objectMetadataNameSingular: 'note',
            },
          },
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <RichTextFieldInput />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
      <div data-testid="click-outside-element" />
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/RichTextFieldInput',
  component: RichTextFieldInputWithContext,
  args: {
    targetableObjectId: 'test-id',
    onClickOutside: handleClickoutsideMocked,
    onEscape: handleEscapeMocked,
  },
  argTypes: {
    onClickOutside: { control: false },
    onEscape: { control: false },
  },
  decorators: [
    clearMocksDecorator,
    SnackBarDecorator,
    I18nFrontDecorator,
    ObjectMetadataItemsDecorator,
  ],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof RichTextFieldInputWithContext>;

export const Default: Story = {};

export const Escape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(handleEscapeMocked).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('click-outside-element');
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

    const outsideElement = await canvas.findByTestId('click-outside-element');

    await userEvent.click(outsideElement);

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledTimes(1);
    });
  },
};
