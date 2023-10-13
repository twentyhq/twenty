import { useEffect } from 'react';
import { expect, jest } from '@storybook/jest';
import { Decorator, Meta, StoryObj } from '@storybook/react';
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
    <FieldContextProvider
      fieldDefinition={{
        key: 'probability',
        name: 'Probability',
        type: 'probability',
        metadata: {
          fieldName: 'Probability',
        },
      }}
      entityId={entityId}
    >
      <ProbabilityFieldValueSetterEffect value={value} />
      <ProbabilityFieldInput onSubmit={onSubmit} />
    </FieldContextProvider>
  );
};

const submitJestFn = jest.fn();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks) {
    submitJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Field/Input/ProbabilityFieldInput',
  component: ProbabilityFieldInputWithContext,
  args: {
    value: 25,
    isPositive: true,
    onSubmit: submitJestFn,
  },
  argTypes: {
    onSubmit: { control: false },
  },
  decorators: [clearMocksDecorator],
  parameters: {
    clearMocks: true,
  },
};

export default meta;

type Story = StoryObj<typeof ProbabilityFieldInputWithContext>;

export const Default: Story = {};

export const Submit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(submitJestFn).toHaveBeenCalledTimes(0);

    const item = (await canvas.findByText('25%'))?.nextElementSibling
      ?.firstElementChild;

    if (item) {
      userEvent.click(item);
    }

    expect(submitJestFn).toHaveBeenCalledTimes(1);
  },
};
