import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FieldMetadataType, type FieldRatingValue } from 'twenty-shared/types';
import { useRatingField } from '@/object-record/record-field/ui/meta-types/hooks/useRatingField';
import { RatingFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RatingFieldInput';

const { FieldInputEventContextProviderWithJestMocks, handleSubmitMocked } =
  getFieldInputEventContextProviderWithJestMocks();

const RatingFieldValueSetterEffect = ({
  value,
}: {
  value: FieldRatingValue;
}) => {
  const { setFieldValue } = useRatingField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type RatingFieldInputWithContextProps = {
  value: FieldRatingValue;
  recordId: string;
};

const RatingFieldInputWithContext = ({
  recordId,
  value,
}: RatingFieldInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: 'Rating',
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
          fieldDefinition: {
            fieldMetadataId: 'rating',
            label: 'Rating',
            iconName: 'IconStar',
            type: FieldMetadataType.RATING,
            metadata: {
              fieldName: 'rating',
              objectMetadataNameSingular: 'person',
            },
          },
          recordId: recordId ?? '123',
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <RatingFieldValueSetterEffect value={value} />
        <FieldInputEventContextProviderWithJestMocks>
          <RatingFieldInput />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleSubmitMocked.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/RatingFieldInput',
  component: RatingFieldInputWithContext,
  args: {
    value: '3',
    onSubmit: handleSubmitMocked,
  },
  argTypes: {
    onSubmit: { control: false },
  },
  decorators: [I18nFrontDecorator, clearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof RatingFieldInputWithContext>;

export const Default: Story = {};

export const Submit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(handleSubmitMocked).toHaveBeenCalledTimes(0);

    const input = canvas.getByRole('slider', { name: 'Rating' });
    const firstStar = input.firstElementChild;

    if (!firstStar) {
      throw new Error('First star element not found');
    }

    await userEvent.click(firstStar);

    await waitFor(() => {
      expect(handleSubmitMocked).toHaveBeenCalledTimes(1);
    });
  },
};
