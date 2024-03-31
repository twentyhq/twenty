import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { FieldMetadataType } from '~/generated/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { useNumberField } from '../../../hooks/useNumberField';
import { NumberFieldDisplay } from '../NumberFieldDisplay';

const NumberFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useNumberField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/NumberFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'number',
            label: 'Number',
            type: FieldMetadataType.Number,
            iconName: 'Icon123',
            metadata: {
              fieldName: 'Number',
              placeHolder: 'Number',
              isPositive: true,
            },
          },
          hotkeyScope: 'hotkey-scope',
          useUpdateRecord: () => [() => undefined, {}],
        }}
      >
        <NumberFieldValueSetterEffect value={args.value} />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: NumberFieldDisplay,
};

export default meta;

type Story = StoryObj<typeof NumberFieldDisplay>;

export const Default: Story = {
  args: {
    value: 100,
  },
};

export const Elipsis: Story = {
  args: {
    value: 1e100,
  },
  parameters: {
    container: { width: 100 },
  },
};

export const Negative: Story = {
  args: {
    value: -1000,
  },
};

export const Float: Story = {
  args: {
    value: 1.357802,
  },
};
