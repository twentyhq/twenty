import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useAddressField } from '@/object-record/record-field/ui/meta-types/hooks/useAddressField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import {
  AddressInput,
  type AddressInputProps,
} from '@/ui/field/input/components/AddressInput';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useEffect } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const AddressValueSetterEffect = ({
  value,
}: {
  value: FieldAddressDraftValue;
}) => {
  const { setFieldValue } = useAddressField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type AddressInputWithContextProps = AddressInputProps & {
  value: string;
  recordId?: string;
};

const AddressInputWithContext = ({
  recordId,
  value,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: AddressInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const instanceId = getRecordFieldInputInstanceId({
    recordId: recordId ?? '',
    fieldName: 'Address',
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
  }, [instanceId, pushFocusItemToFocusStack]);

  return (
    <div>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: instanceId,
        }}
      >
        <FieldContext.Provider
          value={{
            fieldDefinition: {
              fieldMetadataId: 'text',
              label: 'Address',
              type: FieldMetadataType.ADDRESS,
              iconName: 'IconTag',
              metadata: {
                fieldName: 'Address',
                placeHolder: 'Enter text',
                objectMetadataNameSingular: 'person',
              },
            },
            recordId: recordId ?? '123',
            isLabelIdentifier: false,
            isRecordFieldReadOnly: false,
          }}
        >
          <AddressValueSetterEffect value={value} />
          <AddressInput
            instanceId={instanceId}
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            value={value}
            onTab={onTab}
            onShiftTab={onShiftTab}
          />
        </FieldContext.Provider>
        <div data-testid="data-field-input-click-outside-div" />
      </RecordFieldComponentInstanceContext.Provider>
    </div>
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
  title: 'UI/Data/Field/Input/AddressFieldInput',
  component: AddressInputWithContext,
  args: {
    value: {
      addressStreet1: 'Address 1',
      addressStreet2: null,
      addressCity: null,
      addressState: null,
      addressPostcode: null,
      addressCountry: null,
      addressLat: null,
      addressLng: null,
    },
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

type Story = StoryObj<typeof AddressInputWithContext>;

export const Default: Story = {};

export const Enter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(enterJestFn).toHaveBeenCalledTimes(0);

    const addressInput = await canvas.findByDisplayValue('Address 1');

    await userEvent.click(addressInput);

    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(enterJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
