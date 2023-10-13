import { useEffect } from 'react';
import { expect, jest } from '@storybook/jest';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';

import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';

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
  title: 'UI/Field/Input/RelationFieldInput',
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
    mockData: [
      {
        url: 'http://localhost:3000/graphql',
        method: 'POST',
        status: 201,
        response: (request: { body: string }) => {
          const { body } = request;
          const parsedBody = JSON.parse(body);

          if (parsedBody.operationName === 'SearchPeople') {
            return {
              data: {
                searchResults: [
                  {
                    id: '1',
                    phone: '123-456-7890',
                    email: 'john.doe@example.com',
                    city: 'Sample City',
                    firstName: 'John',
                    lastName: 'Doe',
                    displayName: 'John Doe',
                    avatarUrl: 'https://example.com/avatar/john.jpg',
                    createdAt: '2023-10-12T14:20:30Z',
                    __typename: 'Person',
                  },
                  {
                    id: '2',
                    phone: '321-654-0987',
                    email: 'jane.smith@example.com',
                    city: 'Another City',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    displayName: 'Jane Smith',
                    avatarUrl: 'https://example.com/avatar/jane.jpg',
                    createdAt: '2023-09-10T12:15:25Z',
                    __typename: 'Person',
                  },
                ],
              },
            };
          }

          return {
            data: 'Default data',
          };
        },
      },
    ],
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

    const item = await canvas.findByText('Jane Smith');

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
