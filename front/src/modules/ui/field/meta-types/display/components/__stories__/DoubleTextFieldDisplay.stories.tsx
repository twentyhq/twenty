import React, { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { useDoubleTextField } from '../../../hooks/useDoubleTextField';
import { DoubleTextFieldDisplay } from '../DoubleTextFieldDisplay'; // Import your component

import { FieldDisplayContextProvider } from './FieldDisplayContextProvider';

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

  return <></>;
};

type DoubleTextFieldDisplayWithContextProps = {
  firstValue: string;
  secondValue: string;
  entityId?: string;
};

const DoubleTextFieldDisplayWithContext = ({
  firstValue,
  secondValue,
  entityId,
}: DoubleTextFieldDisplayWithContextProps) => {
  return (
    <FieldDisplayContextProvider
      fieldDefinition={{
        key: 'double-text',
        name: 'Double-Text',
        type: 'double-text',
        metadata: {
          firstValueFieldName: 'First-text',
          firstValuePlaceholder: 'First-text',
          secondValueFieldName: 'Second-text',
          secondValuePlaceholder: 'Second-text',
        },
      }}
      entityId={entityId}
    >
      <DoubleTextFieldDisplayValueSetterEffect
        firstValue={firstValue}
        secondValue={secondValue}
      />
      <DoubleTextFieldDisplay />
    </FieldDisplayContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/Display/DoubleTextFieldDisplay',
  component: DoubleTextFieldDisplayWithContext,
};

export default meta;

type Story = StoryObj<typeof DoubleTextFieldDisplayWithContext>;

export const Default: Story = {
  args: {
    firstValue: 'Lorem',
    secondValue: 'ipsum',
  },
};

export const CustomValues: Story = {
  args: {
    firstValue: 'Lorem',
    secondValue: 'ipsum',
  },
};

export const Elipsis: Story = {
  args: {
    firstValue:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    secondValue: 'ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  argTypes: {
    firstValue: { control: true },
    secondValue: { control: true },
  },
  parameters: {
    container: {
      width: 100,
    },
  },
  decorators: [ComponentDecorator],
};
