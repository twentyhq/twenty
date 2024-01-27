import { useEffect } from 'react';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from '@storybook/test';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockDefaultWorkspace } from '~/testing/mock-data/users';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';
import {
  RelationFieldInput,
  RelationFieldInputProps,
} from '../RelationFieldInput';

const RelationWorkspaceSetterEffect = () => {
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  useEffect(() => {
    setCurrentWorkspace(mockDefaultWorkspace);
  }, [setCurrentWorkspace]);

  return <></>;
};

type RelationFieldInputWithContextProps = RelationFieldInputProps & {
  value: number;
  entityId?: string;
};

const RelationFieldInputWithContext = ({
  entityId,
  onSubmit,
  onCancel,
}: RelationFieldInputWithContextProps) => {
  const setHotKeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotKeyScope('hotkey-scope');
  }, [setHotKeyScope]);

  return (
    <div>
      <ObjectMetadataItemsProvider>
        <RelationPickerScope relationPickerScopeId="relation-picker">
          <FieldContextProvider
            fieldDefinition={{
              fieldMetadataId: 'relation',
              label: 'Relation',
              type: 'RELATION',
              iconName: 'IconLink',
              metadata: {
                fieldName: 'Relation',
                relationObjectMetadataNamePlural: 'workspaceMembers',
                relationObjectMetadataNameSingular: 'workspaceMember',
              },
            }}
            entityId={entityId}
          >
            <RelationWorkspaceSetterEffect />
            <RelationFieldInput onSubmit={onSubmit} onCancel={onCancel} />
          </FieldContextProvider>
        </RelationPickerScope>
        <div data-testid="data-field-input-click-outside-div" />
      </ObjectMetadataItemsProvider>
    </div>
  );
};

const submitJestFn = fn();
const cancelJestFn = fn();

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
  decorators: [SnackBarDecorator, clearMocksDecorator],
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

    const item = await canvas.findByText('John Wick');

    await waitFor(() => {
      userEvent.click(item);
      expect(submitJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Cancel: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(cancelJestFn).toHaveBeenCalledTimes(0);
    await canvas.findByText('John Wick');

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');
    fireEvent.click(emptyDiv);

    await waitFor(() => {
      expect(cancelJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
