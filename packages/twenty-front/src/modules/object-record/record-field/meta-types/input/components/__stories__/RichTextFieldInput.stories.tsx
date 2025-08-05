import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { RichTextFieldInput } from '../RichTextFieldInput';

const clickOutsideJestFn = fn();
const escapeJestFn = fn();

type RichTextFieldInputWithContextProps = {
  targetableObjectId?: string;
  onClickOutside?: typeof clickOutsideJestFn;
  onEscape?: typeof escapeJestFn;
};

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks !== false) {
    clickOutsideJestFn.mockClear();
    escapeJestFn.mockClear();
  }
  return <Story />;
};

const RichTextFieldInputWithContext = ({
  targetableObjectId = 'test-id',
  onClickOutside,
  onEscape,
}: RichTextFieldInputWithContextProps) => {
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
        <RichTextFieldInput
          targetableObject={{
            id: targetableObjectId,
            targetObjectNameSingular: CoreObjectNameSingular.Note,
          }}
          onClickOutside={onClickOutside}
          onEscape={onEscape}
        />
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
    onClickOutside: clickOutsideJestFn,
    onEscape: escapeJestFn,
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
    expect(escapeJestFn).toHaveBeenCalledTimes(0);

    await canvas.findByTestId('click-outside-element');
    await userEvent.keyboard('{esc}');

    await waitFor(() => {
      expect(escapeJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const ClickOutside: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(clickOutsideJestFn).toHaveBeenCalledTimes(0);

    const outsideElement = await canvas.findByTestId('click-outside-element');

    await userEvent.click(outsideElement);

    await waitFor(() => {
      expect(clickOutsideJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
