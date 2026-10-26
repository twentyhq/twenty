import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { useEffect } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEventContextType,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useFullNameField } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameField';
import { FullNameFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/FullNameFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const FullNameValueSetterEffect = ({
  value,
}: {
  value: FieldFullNameValue;
}) => {
  const { setFieldValue, setDraftValue } = useFullNameField();

  useEffect(() => {
    setFieldValue(value);
    setDraftValue(value);
  }, [setDraftValue, setFieldValue, value]);

  return <></>;
};

const InitializedFullNameFieldInput = () => {
  const { draftValue } = useFullNameField();

  if (!isDefined(draftValue)) {
    return null;
  }

  return <FullNameFieldInput />;
};

const OpenedFieldInputFocusEffect = ({
  instanceId,
}: {
  instanceId: string;
}) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId,
      },
    });
  }, [instanceId, pushFocusItemToFocusStack]);

  return <></>;
};

type FullNameInputWithContextProps = FieldInputEventContextType & {
  value: FieldFullNameValue;
};

const FullNameInputWithContext = ({
  value,
  onEnter,
  onEscape,
  onClickOutside,
  onTab,
  onShiftTab,
}: FullNameInputWithContextProps) => {
  const instanceId = getRecordFieldInputInstanceId({
    recordId: '123',
    fieldName: 'name',
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      <OpenedFieldInputFocusEffect instanceId={instanceId} />
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            fieldMetadataId: 'name',
            label: 'Name',
            type: FieldMetadataType.FULL_NAME,
            iconName: 'IconUser',
            metadata: {
              fieldName: 'name',
              objectMetadataNameSingular: 'person',
            },
          },
          recordId: '123',
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <FullNameValueSetterEffect value={value} />
        <FieldInputEventContext.Provider
          value={{ onEnter, onEscape, onClickOutside, onTab, onShiftTab }}
        >
          <InitializedFullNameFieldInput />
        </FieldInputEventContext.Provider>
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const enterJestFn = fn();
const tabJestFn = fn();

const clearMocksDecorator: Decorator = (Story) => {
  enterJestFn.mockClear();
  tabJestFn.mockClear();

  return <Story />;
};

const meta: Meta<typeof FullNameInputWithContext> = {
  title: 'UI/Data/Field/Input/FullNameFieldInput',
  component: FullNameInputWithContext,
  args: {
    value: { firstName: 'Jean', lastName: 'Martin' },
    onEnter: enterJestFn,
    onTab: tabJestFn,
  },
  argTypes: {
    onEnter: { control: false },
    onTab: { control: false },
  },
  decorators: [clearMocksDecorator],
};

export default meta;

type Story = StoryObj<typeof FullNameInputWithContext>;

export const TypeFullName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole('textbox', { name: 'Full name' });

    await expect(input).toHaveValue('Jean Martin');

    await userEvent.tripleClick(input);
    await userEvent.keyboard('Jean de la Fontaine{Enter}');

    await waitFor(() =>
      expect(enterJestFn).toHaveBeenLastCalledWith({
        newValue: { firstName: 'Jean', lastName: 'de la Fontaine' },
      }),
    );
  },
};

export const EditNameDetails: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole('textbox', { name: 'Full name' });

    await userEvent.click(canvas.getByRole('button', { name: 'Name details' }));

    const firstNameInput = canvas.getByRole('textbox', { name: 'First name' });

    await expect(firstNameInput).toHaveValue('Jean');

    await userEvent.click(input);
    await userEvent.tab();

    await waitFor(() => expect(firstNameInput).toHaveFocus());

    await userEvent.type(firstNameInput, ' Paul');

    await expect(input).toHaveValue('Jean Paul Martin');

    await userEvent.tab();
    await userEvent.tab();

    await waitFor(() =>
      expect(tabJestFn).toHaveBeenLastCalledWith({
        newValue: { firstName: 'Jean Paul', lastName: 'Martin' },
      }),
    );
  },
};
