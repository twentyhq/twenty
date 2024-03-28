import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useEmailField } from '@/object-record/record-field/meta-types/hooks/useEmailField';
import { FieldMetadataType } from '~/generated/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

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
    MemoryRouterDecorator,
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'email',
            label: 'Email',
            type: FieldMetadataType.Email,
            iconName: 'IconLink',
            metadata: {
              fieldName: 'Email',
              placeHolder: 'Email',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <EmailFieldValueSetterEffect value={args.value} />
        <Story />
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
