import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { FieldEnumValue } from '../../../../types/FieldMetadata';
import { useEnumField } from '../../../hooks/useEnumField';
import { EnumFieldDisplay } from '../EnumFieldDisplay';

const EnumFieldValueSetterEffect = ({ value }: { value: FieldEnumValue }) => {
  const { setFieldValue } = useEnumField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/EnumFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isMainIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'enum',
            label: 'Enum',
            iconName: 'IconTag',
            type: 'ENUM',
            metadata: {
              fieldName: 'Enum',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <EnumFieldValueSetterEffect value={args.value} />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: EnumFieldDisplay,
  args: {
    value: { color: 'purple', text: 'Lorem ipsum' },
  },
};

export default meta;

type Story = StoryObj<typeof EnumFieldDisplay>;

export const Default: Story = {};
