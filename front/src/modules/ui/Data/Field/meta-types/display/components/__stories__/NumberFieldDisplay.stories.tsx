import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { v4 } from 'uuid';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useNumberField } from '../../../hooks/useNumberField';
import { NumberFieldDisplay } from '../NumberFieldDisplay';

const NumberFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useNumberField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type NumberFieldDisplayWithContextProps = {
  value: number;
  entityId?: string;
};

const NumberFieldDisplayWithContext = ({
  value,
  entityId,
}: NumberFieldDisplayWithContextProps) => {
  return (
    <FieldContextProvider
      fieldDefinition={{
        key: 'number',
        name: 'Number',
        type: 'number',
        metadata: {
          fieldName: 'Number',
          placeHolder: 'Number',
          isPositive: true,
        },
      }}
      entityId={entityId}
    >
      <NumberFieldValueSetterEffect value={value} />
      <NumberFieldDisplay />
    </FieldContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/Display/NumberFieldDisplay',
  component: NumberFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof NumberFieldDisplayWithContext>;

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

export const Catalog: CatalogStory<
  Story,
  typeof NumberFieldDisplayWithContext
> = {
  argTypes: {
    value: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
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
