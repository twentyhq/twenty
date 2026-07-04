import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTitleCellTextFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldInput';
import { useOpenNewRecordTitleCell } from '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const recordId = 'record-id';
const fieldName = 'name';

const instanceId = getRecordFieldInputInstanceId({
  recordId,
  fieldName,
  prefix: RecordTitleCellContainerType.PageHeader,
});

// Sets the persisted field value (the record's existing name) in the record store,
// mirroring a loaded record before its title cell is opened for editing.
const FieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useTextField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const {
  FieldInputEventContextProviderWithJestMocks,
  handleClickoutsideMocked,
} = getFieldInputEventContextProviderWithJestMocks();

type RecordTitleCellTextFieldInputWithContextProps = {
  existingName: string;
};

const RecordTitleCellTextFieldInputWithContext = ({
  existingName,
}: RecordTitleCellTextFieldInputWithContextProps) => {
  const { openNewRecordTitleCell } = useOpenNewRecordTitleCell();
  const [isReady, setIsReady] = useState(false);

  // Open the title cell the same way the create flow does; this must seed the
  // draft from the field value set by the child FieldValueSetterEffect above.
  useEffect(() => {
    if (!isReady) {
      openNewRecordTitleCell({ recordId, fieldName });

      setIsReady(true);
    }
  }, [isReady, openNewRecordTitleCell]);

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      <FieldContext.Provider
        value={{
          recordId,
          fieldDefinition: {
            fieldMetadataId: 'name',
            label: 'Name',
            type: FieldMetadataType.TEXT,
            iconName: 'IconText',
            metadata: {
              fieldName,
              objectMetadataNameSingular: 'person',
            },
          },
          isLabelIdentifier: true,
          isRecordFieldReadOnly: false,
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <FieldValueSetterEffect value={existingName} />
          <RecordTitleCellTextFieldInput instanceId={instanceId} />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
      {isReady && <div data-testid="is-ready-marker" />}
      <div data-testid="data-field-input-click-outside-div" />
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleClickoutsideMocked.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/RecordTitleCell/Input/RecordTitleCellTextFieldInput',
  component: RecordTitleCellTextFieldInputWithContext,
  args: {
    existingName: 'Existing name',
  },
  decorators: [clearMocksDecorator, SnackBarDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof RecordTitleCellTextFieldInputWithContext>;

// An untouched title cell has its draft seeded from the field value, so clicking
// outside re-persists the existing name instead of blanking it.
export const PreservesExistingNameWhenUntouched: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    await expect(
      await canvas.findByDisplayValue('Existing name'),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByTestId('data-field-input-click-outside-div'),
    );

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledWith(
        expect.objectContaining({ newValue: 'Existing name' }),
      );
    });
  },
};

// Editing the title persists the new value.
export const PersistsEditedName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    const input = await canvas.findByDisplayValue('Existing name');
    await userEvent.clear(input);
    await userEvent.type(input, 'New name');

    await userEvent.click(
      canvas.getByTestId('data-field-input-click-outside-div'),
    );

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledWith(
        expect.objectContaining({ newValue: 'New name' }),
      );
    });
  },
};

// Clearing the title on purpose still persists an empty value — the seeding fix
// distinguishes "untouched" from "intentionally cleared".
export const AllowsClearingTitle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    await userEvent.clear(await canvas.findByDisplayValue('Existing name'));

    await userEvent.click(
      canvas.getByTestId('data-field-input-click-outside-div'),
    );

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledWith(
        expect.objectContaining({ newValue: '' }),
      );
    });
  },
};
