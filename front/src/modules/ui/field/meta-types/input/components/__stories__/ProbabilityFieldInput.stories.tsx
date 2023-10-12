import { useEffect } from 'react';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useProbabilityField } from '../../../hooks/useProbabilityField';
import {
  ProbabilityFieldInput,
  ProbabilityFieldInputProps,
} from '../ProbabilityFieldInput';

const ProbabilityFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useProbabilityField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type ProbabilityFieldInputWithContextProps = ProbabilityFieldInputProps & {
  value: number;
  entityId?: string;
};

const ProbabilityFieldInputWithContext = ({
  entityId,
  value,
  onSubmit,
}: ProbabilityFieldInputWithContextProps) => {
  const setHotKeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotKeyScope('hotkey-scope');
  }, [setHotKeyScope]);

  return (
    <div>
      <FieldContextProvider
        fieldDefinition={{
          key: 'phone',
          name: 'Phone',
          type: 'phone',
          metadata: {
            fieldName: 'Phone',
            placeHolder: 'Enter phone number',
          },
        }}
        entityId={entityId}
      >
        <ProbabilityFieldValueSetterEffect value={value} />
        <ProbabilityFieldInput onSubmit={onSubmit} />
      </FieldContextProvider>
    </div>
  );
};

const submitJestFn = jest.fn();

const meta: Meta = {
  title: 'UI/Field/Input/ProbabilityFieldInput',
  component: ProbabilityFieldInputWithContext,
  args: {
    value: 1000,
    isPositive: true,
    onSubmit: submitJestFn,
  },
  argTypes: {
    onSubmit: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof ProbabilityFieldInputWithContext>;

export const Default: Story = {};

export const Submit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(submitJestFn).toHaveBeenCalledTimes(0);

    const item = await canvas.findByText('25%');
    userEvent.click(item);

    expect(submitJestFn).toHaveBeenCalledTimes(1);
  },
};
