import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { FieldMetadataType } from '~/generated/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { useDateTimeField } from '../../../hooks/useDateTimeField';
import { DateFieldDisplay } from '../DateFieldDisplay';

const formattedDate = new Date('2023-04-01');

const DateFieldValueSetterEffect = ({ value }: { value: string }) => {
  const { setFieldValue } = useDateTimeField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/DateFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          isLabelIdentifier: false,
          fieldDefinition: {
            fieldMetadataId: 'date',
            label: 'Date',
            type: FieldMetadataType.DateTime,
            iconName: 'IconCalendarEvent',
            metadata: {
              fieldName: 'Date',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <DateFieldValueSetterEffect value={args.value} />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: DateFieldDisplay,
  argTypes: { value: { control: 'date' } },
  args: {
    value: formattedDate,
  },
};

export default meta;

type Story = StoryObj<typeof DateFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};
