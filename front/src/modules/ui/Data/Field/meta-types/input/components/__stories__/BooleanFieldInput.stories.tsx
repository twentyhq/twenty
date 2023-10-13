import { useEffect } from 'react';
import { jest } from '@storybook/jest';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useBooleanField } from '../../../hooks/useBooleanField';
import {
  BooleanFieldInput,
  BooleanFieldInputProps,
} from '../BooleanFieldInput';

const BooleanFieldValueSetterEffect = ({ value }: { value: boolean }) => {
  const { setFieldValue } = useBooleanField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type BooleanFieldInputWithContextProps = BooleanFieldInputProps & {
  value: boolean;
  entityId?: string;
};

const BooleanFieldInputWithContext = ({
  value,
  entityId,
  onSubmit,
}: BooleanFieldInputWithContextProps) => {
  return (
    <FieldContextProvider
      fieldDefinition={{
        key: 'boolean',
        name: 'Boolean',
        type: 'boolean',
        metadata: {
          fieldName: 'Boolean',
        },
      }}
      entityId={entityId}
    >
      <BooleanFieldValueSetterEffect value={value} />
      <BooleanFieldInput onSubmit={onSubmit} testId="boolean-field-input" />
    </FieldContextProvider>
  );
};

const meta: Meta = {
  title: 'UI/Field/Input/BooleanFieldInput',
  component: BooleanFieldInputWithContext,
  args: {
    value: true,
  },
};

export default meta;

type Story = StoryObj<typeof BooleanFieldInputWithContext>;

const submitJestFn = jest.fn();

export const Default: Story = {};

export const Toggle: Story = {
  args: {
    onSubmit: submitJestFn,
  },
  argTypes: {
    onSubmit: {
      control: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId('boolean-field-input');

    const trueText = await within(input).findByText('True');

    await expect(trueText).toBeInTheDocument();

    await expect(submitJestFn).toHaveBeenCalledTimes(0);

    await userEvent.click(input);

    await expect(input).toHaveTextContent('False');

    await expect(submitJestFn).toHaveBeenCalledTimes(1);

    await userEvent.click(input);

    await expect(input).toHaveTextContent('True');

    await expect(submitJestFn).toHaveBeenCalledTimes(2);
  },
};
