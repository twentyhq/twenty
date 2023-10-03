import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useRecoilCallback } from 'recoil';

import {
  FieldContext,
  GenericFieldContextType,
} from '@/ui/field/contexts/FieldContext';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';

import { MoneyFieldDisplay } from '../MoneyFieldDisplay';

const MoneyFieldDisplayWithContext = (props: GenericFieldContextType) => {
  const setFieldState = useRecoilCallback(
    ({ set }) =>
      () => {
        set(
          entityFieldsFamilySelector({
            entityId: props.entityId,
            fieldName: props.fieldDefinition.name,
          }),
          '1000',
        );
      },
    [props],
  );

  useEffect(() => {
    setFieldState();
  }, [setFieldState]);

  return (
    <FieldContext.Provider value={props}>
      <MoneyFieldDisplay />
    </FieldContext.Provider>
  );
};

const meta: Meta = {
  title: 'UI/Field/MoneyFieldDisplay',
  component: MoneyFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof MoneyFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    fieldDefinition: {
      key: 'money',
      name: 'Money',
      type: 'moneyAmount',
      metadata: {
        fieldName: 'Amount',
        placeHolder: 'Amount',
        isPositive: true,
      },
    },
    useUpdateEntityMutation: () => [
      () => {
        return;
      },
      {},
    ],
  },
};
