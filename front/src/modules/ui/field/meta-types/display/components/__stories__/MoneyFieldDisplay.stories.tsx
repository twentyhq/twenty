import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { v4 } from 'uuid';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useMoneyField } from '../../../hooks/useMoneyField';
import { MoneyFieldDisplay } from '../MoneyFieldDisplay';

const MoneyFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useMoneyField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type MoneyFieldDisplayWithContextProps = {
  value: number;
  entityId?: string;
};

const MoneyFieldDisplayWithContext = ({
  value,
  entityId,
}: MoneyFieldDisplayWithContextProps) => {
  return (
    <FieldContextProvider
      fieldDefinition={{
        key: 'money',
        name: 'Money',
        type: 'moneyAmount',
        metadata: {
          fieldName: 'Amount',
          placeHolder: 'Amount',
          isPositive: true,
        },
      }}
      entityId={entityId}
    >
      <MoneyFieldValueSetterEffect value={value} />
      <MoneyFieldDisplay />
    </FieldContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/Display/MoneyFieldDisplay',
  component: MoneyFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof MoneyFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    value: 100,
  },
};

export const Elipsis: Story = {
  args: {
    value: 1e100,
  },
  argTypes: {
    value: { control: false },
  },
  parameters: {
    container: {
      width: 100,
    },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MoneyFieldDisplayWithContext> =
  {
    argTypes: {
      value: { control: false },
    },
    parameters: {
      catalog: {
        dimensions: [
          {
            name: 'currency',
            values: ['$'] satisfies string[],
            props: (_value: string) => ({}),
          },
          {
            name: 'value',
            values: [
              100, 1000, -1000, 1e10, 1.357802, -1.283, 0,
            ] satisfies number[],
            props: (value: number) => ({ value, entityId: v4() }),
          },
        ],
        options: {
          elementContainer: {
            width: 100,
          },
        },
      },
    },
    decorators: [CatalogDecorator],
  };
