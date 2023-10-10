import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { useEmailField } from '../../../hooks/useEmailField';
import { EmailFieldDisplay } from '../EmailFieldDisplay';

import { FieldDisplayContextProvider } from './FieldDisplayContextProvider';

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
    <FieldDisplayContextProvider
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
    </FieldDisplayContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/EmailFieldDisplay',
  component: EmailFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof EmailFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    value: 'Test@Test.test',
  },
};
