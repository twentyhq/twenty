import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { useMoneyField } from '../../../hooks/useMoneyField';
import { MoneyFieldDisplay } from '../MoneyFieldDisplay';

const MoneyFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useMoneyField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/MoneyFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isMainIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'money',
            label: 'Money',
            type: 'MONEY_AMOUNT',
            iconName: 'Icon123',
            metadata: {
              fieldName: 'Amount',
              placeHolder: 'Amount',
              isPositive: true,
            },
          },
          hotkeyScope: 'hotkey-scope',
          useUpdateEntityMutation: () => [() => undefined, undefined],
        }}
      >
        <MoneyFieldValueSetterEffect value={args.value} />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: MoneyFieldDisplay,
  args: {
    value: 100,
  },
};

export default meta;

type Story = StoryObj<typeof MoneyFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  args: {
    value: 1e100,
  },
  parameters: {
    container: { width: 100 },
  },
};
