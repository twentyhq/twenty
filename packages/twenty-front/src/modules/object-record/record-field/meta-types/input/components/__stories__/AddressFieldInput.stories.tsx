import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useAddressField } from '@/object-record/record-field/meta-types/hooks/useAddressField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import {
  AddressInput,
  AddressInputProps,
} from '@/ui/field/input/components/AddressInput';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
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
  const setHotKeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotKeyScope(DEFAULT_CELL_SCOPE.scope);
  }, [setHotKeyScope]);

  return (
    <div>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: getRecordFieldInputId(
            recordId ?? '',
            'Address',
            'record-table-cell',
          ),
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
            isReadOnly: false,
          }}
        >
          <AddressValueSetterEffect value={value} />
          <AddressInput
            onEnter={onEnter}
            onEscape={onEscape}
            onClickOutside={onClickOutside}
            value={value}
            hotkeyScope={DEFAULT_CELL_SCOPE.scope}
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

    await canvas.findByText('Address 1');
    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(enterJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
