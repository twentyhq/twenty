import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getFieldInputEventContextProviderWithJestMocks } from '@/object-record/record-field/ui/meta-types/input/components/__stories__/utils/getFieldInputEventContextProviderWithJestMocks';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { BooleanFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/BooleanFieldInput';

const { FieldInputEventContextProviderWithJestMocks, handleSubmitMocked } =
  getFieldInputEventContextProviderWithJestMocks();

const BooleanFieldValueSetterEffect = ({
  value,
  recordId,
}: {
  value: boolean;
  recordId: string;
}) => {
  const setField = useSetRecoilState(recordStoreFamilyState(recordId));

  useEffect(() => {
    setField({ id: recordId, Boolean: value, __typename: 'Person' });
  }, [recordId, setField, value]);

  return <></>;
};

type BooleanFieldInputWithContextProps = {
  value: boolean;
  recordId?: string;
};

const BooleanFieldInputWithContext = ({
  value,
  recordId,
}: BooleanFieldInputWithContextProps) => {
  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputInstanceId({
          recordId: recordId ?? '',
          fieldName: 'Boolean',
          prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
        }),
      }}
    >
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            defaultValue: false,
            fieldMetadataId: 'boolean',
            label: 'Boolean',
            iconName: 'Icon123',
            type: FieldMetadataType.BOOLEAN,
            metadata: {
              fieldName: 'Boolean',
              objectMetadataNameSingular: 'person',
            },
          },
          recordId: recordId ?? '123',
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <FieldInputEventContextProviderWithJestMocks>
          <BooleanFieldValueSetterEffect
            value={value}
            recordId={recordId ?? ''}
          />
          <BooleanFieldInput testId="boolean-field-input" />
        </FieldInputEventContextProviderWithJestMocks>
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/BooleanFieldInput',
  component: BooleanFieldInputWithContext,
  decorators: [I18nFrontDecorator],
  args: {
    value: true,
    recordId: 'id-1',
  },
};

export default meta;

type Story = StoryObj<typeof BooleanFieldInputWithContext>;

export const Default: Story = {};

export const Toggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId('boolean-field-input');

    const trueText = await within(input).findByText('True');

    await expect(trueText).toBeInTheDocument();

    await expect(handleSubmitMocked).toHaveBeenCalledTimes(0);

    await userEvent.click(input);

    await expect(input).toHaveTextContent('False');

    await expect(handleSubmitMocked).toHaveBeenCalledTimes(1);

    await userEvent.click(input);

    await expect(input).toHaveTextContent('True');

    await expect(handleSubmitMocked).toHaveBeenCalledTimes(2);
  },
};
