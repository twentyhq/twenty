import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FieldContext } from '../../../../contexts/FieldContext';
import { useDoubleTextField } from '../../../hooks/useDoubleTextField';
import { DoubleTextFieldDisplay } from '../DoubleTextFieldDisplay'; // Import your component

const DoubleTextFieldDisplayValueSetterEffect = ({
  firstValue,
  secondValue,
}: {
  firstValue: string;
  secondValue: string;
}) => {
  const { setFirstValue, setSecondValue } = useDoubleTextField();

  useEffect(() => {
    setFirstValue(firstValue);
    setSecondValue(secondValue);
  }, [setFirstValue, setSecondValue, firstValue, secondValue]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/DoubleTextFieldDisplay',
  decorators: [
    (Story, { args }) => (
      <FieldContext.Provider
        value={{
          entityId: '',
          fieldDefinition: {
            fieldMetadataId: 'double-text',
            label: 'Double-Text',
            type: 'DOUBLE_TEXT',
            metadata: {
              firstValueFieldName: 'First-text',
              firstValuePlaceholder: 'First-text',
              secondValueFieldName: 'Second-text',
              secondValuePlaceholder: 'Second-text',
            },
          },
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <DoubleTextFieldDisplayValueSetterEffect
          firstValue={args.firstValue}
          secondValue={args.secondValue}
        />
        <Story />
      </FieldContext.Provider>
    ),
    ComponentDecorator,
  ],
  component: DoubleTextFieldDisplay,
  args: {
    firstValue: 'Lorem',
    secondValue: 'ipsum',
  },
};

export default meta;

type Story = StoryObj<typeof DoubleTextFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  args: {
    firstValue:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    secondValue: 'ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  parameters: {
    container: { width: 100 },
  },
};
