import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useTextField } from '@/object-record/record-field/ui/meta-types/hooks/useTextField';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTitleCellTextFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldInput';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const recordId = 'record-id';

const instanceId = getRecordFieldInputInstanceId({
  recordId,
  fieldName: 'name',
  prefix: RecordTitleCellContainerType.ShowPage,
});

// Sets the persisted field value (the record's existing name) without touching
// the draft — mirrors a loaded record whose title cell has not been edited.
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
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) {
      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.OPENED_FIELD_INPUT,
          instanceId,
        },
      });

      setIsReady(true);
    }
  }, [isReady, pushFocusItemToFocusStack]);

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
              fieldName: 'name',
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

// An untouched title cell (draft never set) must not persist on click outside,
// so opening another field can't blank the record's existing name.
export const SkipsPersistWhenUntouched: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    await userEvent.click(
      canvas.getByTestId('data-field-input-click-outside-div'),
    );

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledWith(
        expect.objectContaining({ skipPersist: true }),
      );
    });
  },
};

// Once the user edits the title, click outside persists the new value.
export const PersistsAfterEdit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('is-ready-marker');

    await userEvent.type(canvas.getByPlaceholderText('Name'), 'New name');

    await userEvent.click(
      canvas.getByTestId('data-field-input-click-outside-div'),
    );

    await waitFor(() => {
      expect(handleClickoutsideMocked).toHaveBeenCalledWith(
        expect.objectContaining({ skipPersist: false, newValue: 'New name' }),
      );
    });
  },
};
