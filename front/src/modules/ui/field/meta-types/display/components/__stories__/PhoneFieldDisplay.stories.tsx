import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { usePhoneField } from '../../../hooks/usePhoneField';
import { PhoneFieldDisplay } from '../PhoneFieldDisplay';

import { FieldDisplayContextProvider } from './FieldDisplayContextProvider';

const PhoneFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = usePhoneField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type PhoneFieldDisplayWithContextProps = {
  value: string;
  entityId?: string;
};

const PhoneFieldDisplayWithContext = ({
  value,
  entityId,
}: PhoneFieldDisplayWithContextProps) => {
  return (
    <FieldDisplayContextProvider
      fieldDefinition={{
        key: 'phone',
        name: 'Phone',
        type: 'phone',
        metadata: {
          fieldName: 'Phone',
          placeHolder: 'Phone',
        },
      }}
      entityId={entityId}
    >
      <MemoryRouter>
        <PhoneFieldValueSetterEffect value={value} />
        <PhoneFieldDisplay />
      </MemoryRouter>
    </FieldDisplayContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/PhoneFieldDisplay',
  component: PhoneFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof PhoneFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    value: '362763872687362',
  },
};

export const Elipsis: Story = {
  args: {
    value: '362763872687362',
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
