import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { useEmailField } from '../../../hooks/useEmailField';
import { EmailFieldDisplay } from '../EmailFieldDisplay';

const EmailFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useEmailField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/EmailFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'email',
            label: 'Email',
            type: 'EMAIL',
            iconName: 'IconLink',
            metadata: {
              fieldName: 'Email',
              placeHolder: 'Email',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <MemoryRouter>
          <EmailFieldValueSetterEffect value={args.value} />
          <Story />
        </MemoryRouter>
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: EmailFieldDisplay,
  args: {
    value: 'Test@Test.test',
  },
};

export default meta;

type Story = StoryObj<typeof EmailFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};
