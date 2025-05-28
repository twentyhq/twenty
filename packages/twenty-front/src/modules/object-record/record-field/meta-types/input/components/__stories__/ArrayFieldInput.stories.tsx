import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useArrayField } from '@/object-record/record-field/meta-types/hooks/useArrayField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { ArrayFieldInput } from '../ArrayFieldInput';

const updateRecord = fn();

const ArrayValueSetterEffect = ({ value }: { value: string[] }) => {
  const { setFieldValue } = useArrayField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

type ArrayFieldValueGaterProps = Pick<
  ArrayInputWithContextProps,
  'onCancel' | 'onClickOutside'
>;

const ArrayFieldValueGater = ({
  onCancel,
  onClickOutside,
}: ArrayFieldValueGaterProps) => {
  const { fieldValue } = useArrayField();

  return (
    fieldValue && (
      <ArrayFieldInput onCancel={onCancel} onClickOutside={onClickOutside} />
    )
  );
};

type ArrayInputWithContextProps = {
  value: string[];
  recordId?: string;
  onCancel?: () => void;
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
};

const ArrayInputWithContext = ({
  value,
  recordId = 'record-id',
  onCancel,
  onClickOutside,
}: ArrayInputWithContextProps) => {
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(DEFAULT_CELL_SCOPE.scope);
  }, [setHotkeyScope]);

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputId(
          recordId,
          'tags',
          'record-table-cell',
        ),
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
          isReadOnly: false,
          useUpdateRecord: () => [updateRecord, { loading: false }],
        }}
      >
        <ArrayValueSetterEffect value={value} />
        <ArrayFieldValueGater
          onCancel={onCancel}
          onClickOutside={onClickOutside}
        />
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof ArrayInputWithContext> = {
  title: 'UI/Input/ArrayFieldInput',
  component: ArrayInputWithContext,
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

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith({
        variables: {
          where: { id: 'record-id' },
          updateOneRecordInput: {
            tags: [
              'tag1',
              'tag2',
              'tag2', // The second tag2 is not trimmed, so it remains as a duplicate
            ],
          },
        },
      });
    });
    expect(updateRecord).toHaveBeenCalledTimes(1);
  },
};
