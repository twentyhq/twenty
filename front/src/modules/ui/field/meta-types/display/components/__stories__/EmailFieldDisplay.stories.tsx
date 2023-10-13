import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useEmailField } from '../../../hooks/useEmailField';
import { EmailFieldDisplay } from '../EmailFieldDisplay';

const EmailFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useEmailField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type EmailFieldDisplayWithContextProps = {
  value: string;
  entityId?: string;
};

const EmailFieldDisplayWithContext = ({
  value,
  entityId,
}: EmailFieldDisplayWithContextProps) => {
  return (
    <FieldContextProvider
      fieldDefinition={{
        key: 'email',
        name: 'Email',
        type: 'email',
        metadata: {
          fieldName: 'Email',
          placeHolder: 'Email',
        },
      }}
      entityId={entityId}
    >
      <MemoryRouter>
        <EmailFieldValueSetterEffect value={value} />
        <EmailFieldDisplay />
      </MemoryRouter>
    </FieldContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/Display/EmailFieldDisplay',
  component: EmailFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof EmailFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    value: 'Test@Test.test',
  },
};

export const Elipsis: Story = {
  args: {
    value: 'Test@Test.test',
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
