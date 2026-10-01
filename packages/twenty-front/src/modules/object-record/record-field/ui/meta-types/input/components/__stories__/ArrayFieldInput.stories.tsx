import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

import { ArrayFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldInput';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const {
  FieldInputEventContextProviderWithJestMocks,
  handleEscapeMocked,
  handleClickoutsideMocked,
} = getFieldInputEventContextProviderWithJestMocks();

const ArrayValueSetterEffect = ({ value }: { value: string[] }) => {
  const { setFieldValue, setDraftValue } = useArrayField();

  useEffect(() => {
    setFieldValue(value);
    setDraftValue(value);
  }, [setFieldValue, value, setDraftValue]);

  return null;
};

const ArrayFieldValueGater = () => {
  const { fieldValue } = useArrayField();

  return fieldValue ? <ArrayFieldInput /> : null;
};

type ArrayInputWithContextProps = {
  value: string[];
  recordId?: string;
};

const ArrayInputWithContext = ({
  value,
  recordId = 'record-id',
}: ArrayInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'tags',
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
        instanceId: getRecordFieldInputInstanceId({
          recordId,
          fieldName: 'tags',
          prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
        }),
      }}
    >
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            fieldMetadataId: 'tags',
            label: 'Tags',
            type: FieldMetadataType.ARRAY,
            iconName: 'IconTags',
            metadata: {
              fieldName: 'tags',
              placeHolder: 'Enter value',
              objectMetadataNameSingular: 'company',
            },
          },
          recordId,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <ArrayValueSetterEffect value={value} />
          <ArrayFieldValueGater />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof ArrayInputWithContext> = {
  title: 'UI/Input/ArrayFieldInput',
  component: ArrayInputWithContext,
  decorators: [],
};

export default meta;
type Story = StoryObj<typeof ArrayInputWithContext>;

export const Default: Story = {
  args: {
    value: ['tag1', 'tag2'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByText('Add Item');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('Enter value');
    await userEvent.type(input, 'tag3{enter}');

    const tag3Element = await canvas.findByText('tag3');
    expect(tag3Element).toBeVisible();
  },
};

export const TrimInput: Story = {
  args: {
    value: ['tag1', 'tag2'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = await canvas.findByText('Add Item');
    await userEvent.click(addButton);

    const input = await canvas.findByPlaceholderText('Enter value');
    await userEvent.type(input, '  tag2  {enter}');

    await waitFor(() => {
      const tag2Elements = canvas.queryAllByText('tag2');
      expect(tag2Elements).toHaveLength(2);
    });
  },
};

export const SearchAndEditItem: Story = {
  args: {
    value: ['tag1', 'tag2', 'tag3', 'tag4'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const searchInput = await canvas.findByPlaceholderText('Search');

    await userEvent.type(searchInput, 'tag3');
    await waitFor(() => {
      expect(canvas.queryByText('tag1')).not.toBeInTheDocument();
    });

    const item = await canvas.findByText('tag3');

    await userEvent.click(item);
    expect(body.queryByRole('menu')).not.toBeInTheDocument();

    const optionsButton = await canvas.findByRole('button', {
      name: 'More options',
    });

    await userEvent.click(optionsButton);
    expect(optionsButton).toBeVisible();
    await body.findByRole('menuitem', { name: 'Edit' });
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(body.queryByRole('menu')).not.toBeInTheDocument();
    });
    expect(handleEscapeMocked).not.toHaveBeenCalled();
    expect(handleClickoutsideMocked).not.toHaveBeenCalled();
    expect(optionsButton).toHaveFocus();

    await userEvent.click(optionsButton);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));

    const input = await canvas.findByPlaceholderText('Enter value');

    expect(input).toHaveValue('tag3');
    await userEvent.clear(input);
    await userEvent.type(input, 'tag3-edited{Enter}');

    expect(await canvas.findByText('tag3-edited')).toBeVisible();
    expect(handleClickoutsideMocked).not.toHaveBeenCalled();
  },
};
