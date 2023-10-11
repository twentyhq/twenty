import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { useDateField } from '../../../hooks/useDateField';
import { DateFieldDisplay } from '../DateFieldDisplay';

import { FieldDisplayContextProvider } from './FieldDisplayContextProvider';

const formattedDate = new Date();

const DateFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useDateField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type DateFieldDisplayWithContextProps = {
  value: string;
  entityId?: string;
};

const DateFieldDisplayWithContext = ({
  value,
  entityId,
}: DateFieldDisplayWithContextProps) => {
  return (
    <FieldDisplayContextProvider
      fieldDefinition={{
        key: 'date',
        name: 'Date',
        type: 'date',
        metadata: {
          fieldName: 'Date',
        },
      }}
      entityId={entityId}
    >
      <DateFieldValueSetterEffect value={value} />
      <DateFieldDisplay />
    </FieldDisplayContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/Display/DateFieldDisplay',
  component: DateFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof DateFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    value: formattedDate.toISOString(),
  },
};

export const Elipsis: Story = {
  args: {
    value: formattedDate.toISOString(),
  },
  argTypes: {
    value: { control: false },
  },
  parameters: {
    container: {
      width: 50,
    },
  },
  decorators: [ComponentDecorator],
};
