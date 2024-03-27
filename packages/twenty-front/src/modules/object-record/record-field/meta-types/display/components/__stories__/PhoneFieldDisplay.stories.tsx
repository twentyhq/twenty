import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePhoneField } from '@/object-record/record-field/meta-types/hooks/usePhoneField';
import { FieldMetadataType } from '~/generated/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

import { PhoneFieldDisplay } from '../PhoneFieldDisplay';

const PhoneFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = usePhoneField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/PhoneFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'phone',
            label: 'Phone',
            type: FieldMetadataType.Text,
            iconName: 'IconPhone',
            metadata: {
              fieldName: 'phone',
              placeHolder: 'Phone',
              objectMetadataNameSingular: 'person',
            },
          },
          hotkeyScope: 'hotkey-scope',
          useUpdateRecord: () => [() => undefined, {}],
        }}
      >
        <PhoneFieldValueSetterEffect value={args.value} />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: PhoneFieldDisplay,
  args: {
    value: '362763872687362',
  },
};

export default meta;

type Story = StoryObj<typeof PhoneFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};
