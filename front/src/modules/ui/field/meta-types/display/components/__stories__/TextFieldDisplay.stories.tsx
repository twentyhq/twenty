import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { v4 } from 'uuid';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useTextField } from '../../../hooks/useTextField';
import { TextFieldDisplay } from '../TextFieldDisplay';

const TextFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useTextField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type TextFieldDisplayWithContextProps = {
  value: string;
  entityId?: string;
};

const TextFieldDisplayWithContext = ({
  value,
  entityId,
}: TextFieldDisplayWithContextProps) => {
  return (
    <FieldContextProvider
      fieldDefinition={{
        key: 'text',
        name: 'Text',
        type: 'text',
        metadata: {
          fieldName: 'Text',
          placeHolder: 'Text',
        },
      }}
      entityId={entityId}
    >
      <TextFieldValueSetterEffect value={value} />
      <TextFieldDisplay />
    </FieldContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/Display/TextFieldDisplay',
  component: TextFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof TextFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    value: 'Lorem ipsum',
  },
};

export const Elipsis: Story = {
  args: {
    value:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae rerum fugiat veniam illum accusantium saepe, voluptate inventore libero doloribus doloremque distinctio blanditiis amet quis dolor a nulla? Placeat nam itaque rerum esse quidem animi, temporibus saepe debitis commodi quia eius eos minus inventore. Voluptates fugit optio sit ab consectetur ipsum, neque eius atque blanditiis. Ullam provident at porro minima, nobis vero dicta consequatur maxime laboriosam fugit repudiandae repellat tempore voluptas non voluptatibus neque aliquam ducimus doloribus ipsa? Sapiente suscipit unde modi commodi possimus doloribus eum voluptatibus, architecto laudantium, magnam, eos numquam exercitationem est maxime explicabo odio nemo qui distinctio temporibus.',
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

export const Catalog: CatalogStory<Story, typeof TextFieldDisplayWithContext> =
  {
    argTypes: {
      value: { control: false },
    },
    parameters: {
      catalog: {
        dimensions: [
          {
            name: 'value',
            values: [
              'Hello world',
              'Test',
              '1234567890',
              ' ',
              'Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae rerum fugiat veniam illum accusantium saepe, voluptate inventore libero doloribus doloremque distinctio blanditiis amet quis dolor a nulla? Placeat nam itaque rerum esse quidem animi, temporibus saepe debitis commodi quia eius eos minus inventore. Voluptates fugit optio sit ab consectetur ipsum, neque eius atque blanditiis. Ullam provident at porro minima, nobis vero dicta consequatur maxime laboriosam fugit repudiandae repellat tempore voluptas non voluptatibus neque aliquam ducimus doloribus ipsa? Sapiente suscipit unde modi commodi possimus doloribus eum voluptatibus, architecto laudantium, magnam, eos numquam exercitationem est maxime explicabo odio nemo qui distinctio temporibus.',
            ] satisfies string[],
            props: (value: string) => ({ value, entityId: v4() }),
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
