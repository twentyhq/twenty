import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { FieldMetadataType } from '~/generated/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { useTextField } from '../../../hooks/useTextField';
import { TextFieldDisplay } from '../TextFieldDisplay';

const TextFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useTextField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/TextFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'text',
            label: 'Text',
            type: FieldMetadataType.Text,
            iconName: 'IconLink',
            metadata: {
              fieldName: 'Text',
              placeHolder: 'Text',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <TextFieldValueSetterEffect value={args.value} />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: TextFieldDisplay,
  args: {
    value: 'Lorem ipsum',
  },
};

export default meta;

type Story = StoryObj<typeof TextFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  args: {
    value:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae rerum fugiat veniam illum accusantium saepe, voluptate inventore libero doloribus doloremque distinctio blanditiis amet quis dolor a nulla? Placeat nam itaque rerum esse quidem animi, temporibus saepe debitis commodi quia eius eos minus inventore. Voluptates fugit optio sit ab consectetur ipsum, neque eius atque blanditiis. Ullam provident at porro minima, nobis vero dicta consequatur maxime laboriosam fugit repudiandae repellat tempore voluptas non voluptatibus neque aliquam ducimus doloribus ipsa? Sapiente suscipit unde modi commodi possimus doloribus eum voluptatibus, architecto laudantium, magnam, eos numquam exercitationem est maxime explicabo odio nemo qui distinctio temporibus.',
  },
  parameters: {
    container: { width: 100 },
  },
};
