import { useEffect } from 'react';
import { MemoryRouter } from 'react-router';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { useURLField } from '../../../hooks/useURLField';
import { URLFieldDisplay } from '../URLFieldDisplay';

const URLFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useURLField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/URLFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          fieldDefinition: {
            fieldId: 'URL',
            label: 'URL',
            type: 'URL',
            metadata: {
              fieldName: 'URL',
              placeHolder: 'URL',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <MemoryRouter>
          <URLFieldValueSetterEffect value={args.value} />
          <Story />
        </MemoryRouter>
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: URLFieldDisplay,
  args: {
    value: 'https://github.com/twentyhq',
  },
};

export default meta;

type Story = StoryObj<typeof URLFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 200 },
  },
};
