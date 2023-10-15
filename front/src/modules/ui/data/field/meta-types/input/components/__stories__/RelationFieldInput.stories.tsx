import { useEffect } from 'react';
import { expect, jest } from '@storybook/jest';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';

import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

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
          key: 'relation',
          name: 'Relation',
          type: 'relation',
          metadata: {
            fieldName: 'Relation',
            relationType: Entity.Person,
          },
        }}
        entityId={entityId}
      >
        <RelationFieldValueSetterEffect value={value} />
        <RelationFieldInput onSubmit={onSubmit} onCancel={onCancel} />
      </FieldContextProvider>
      <div data-testid="data-field-input-click-outside-div" />
    </div>
  );
};

const submitJestFn = jest.fn();
const cancelJestFn = jest.fn();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks) {
    submitJestFn.mockClear();
    cancelJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/RelationFieldInput',
  component: RelationFieldInputWithContext,
  args: {
    useEditButton: true,
    onSubmit: submitJestFn,
    onCancel: cancelJestFn,
  },
  argTypes: {
    onSubmit: { control: false },
    onCancel: { control: false },
  },
  decorators: [clearMocksDecorator],
  parameters: {
    clearMocks: true,
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof RelationFieldInputWithContext>;

export const Default: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
};

export const Submit: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(submitJestFn).toHaveBeenCalledTimes(0);

    const item = await canvas.findByText('Jane Doe');

    userEvent.click(item);

    expect(submitJestFn).toHaveBeenCalledTimes(1);
  },
};

export const Cancel: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(cancelJestFn).toHaveBeenCalledTimes(0);

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');

    await waitFor(() => {
      userEvent.click(emptyDiv);
      expect(cancelJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
