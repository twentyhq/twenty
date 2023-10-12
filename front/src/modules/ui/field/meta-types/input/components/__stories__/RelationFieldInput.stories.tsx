import { useEffect } from 'react';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import { useRelationField } from '../../../hooks/useRelationField';
import {
  RelationFieldInput,
  RelationFieldInputProps,
} from '../RelationFieldInput';

const RelationFieldValueSetterEffect = ({ value }: { value: number }) => {
  const { setFieldValue } = useRelationField();

  useEffect(() => {
    setFieldValue(value);
  }, [setFieldValue, value]);

  return <></>;
};

type RelationFieldInputWithContextProps = RelationFieldInputProps & {
  value: number;
  entityId?: string;
};

const RelationFieldInputWithContext = ({
  entityId,
  value,
  onSubmit,
  onCancel,
}: RelationFieldInputWithContextProps) => {
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
        <RelationFieldValueSetterEffect value={value} />
        <RelationFieldInput onSubmit={onSubmit} onCancel={onCancel} />
      </FieldContextProvider>
    </div>
  );
};

const submitJestFn = jest.fn();
const cancelJestFn = jest.fn();

const meta: Meta = {
  title: 'UI/Field/Input/RelationFieldInput',
  component: RelationFieldInputWithContext,
  args: {
    value: 1000,
    isPositive: true,
    onSubmit: submitJestFn,
    onCancel: cancelJestFn,
  },
  argTypes: {
    onSubmit: { control: false },
    onCancel: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof RelationFieldInputWithContext>;

export const Default: Story = {};

// TODO: We need to do some more work here to get this to work.
export const Submit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(submitJestFn).toHaveBeenCalledTimes(0);

    const item = await canvas.findByText('25%');
    userEvent.click(item);

    expect(submitJestFn).toHaveBeenCalledTimes(1);
  },
};
