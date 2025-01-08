import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated/graphql';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { FieldContextProvider } from '@/object-record/record-field/meta-types/components/FieldContextProvider';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { getCanvasElementForDropdownTesting } from 'twenty-ui';
import {
  RelationToOneFieldInput,
  RelationToOneFieldInputProps,
} from '../RelationToOneFieldInput';

const RelationWorkspaceSetterEffect = () => {
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  useEffect(() => {
    setCurrentWorkspace(mockCurrentWorkspace);
    setCurrentWorkspaceMember(mockedWorkspaceMemberData);
  }, [setCurrentWorkspace, setCurrentWorkspaceMember]);

  return <></>;
};

type RelationToOneFieldInputWithContextProps = RelationToOneFieldInputProps & {
  value: number;
  recordId?: string;
};

const RelationToOneFieldInputWithContext = ({
  recordId,
  onSubmit,
  onCancel,
}: RelationToOneFieldInputWithContextProps) => {
  const setHotKeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotKeyScope('hotkey-scope');
  }, [setHotKeyScope]);

  return (
    <div>
      <FieldContextProvider
        fieldDefinition={{
          fieldMetadataId: 'relation',
          label: 'Relation',
          type: FieldMetadataType.Relation,
          iconName: 'IconLink',
          metadata: {
            fieldName: 'Relation',
            relationObjectMetadataNamePlural: 'workspaceMembers',
            relationObjectMetadataNameSingular:
              CoreObjectNameSingular.WorkspaceMember,
            objectMetadataNameSingular: 'person',
            relationFieldMetadataId: '20202020-8c37-4163-ba06-1dada334ce3e',
          },
        }}
        recordId={recordId}
      >
        <RecordPickerComponentInstanceContext.Provider
          value={{ instanceId: 'relation-to-one-field-input' }}
        >
          <RelationWorkspaceSetterEffect />
          <RelationToOneFieldInput onSubmit={onSubmit} onCancel={onCancel} />
        </RecordPickerComponentInstanceContext.Provider>
      </FieldContextProvider>
      <div data-testid="data-field-input-click-outside-div" />
    </div>
  );
};

const submitJestFn = fn();
const cancelJestFn = fn();

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    submitJestFn.mockClear();
    cancelJestFn.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/RelationToOneFieldInput',
  component: RelationToOneFieldInputWithContext,
  args: {
    useEditButton: true,
    onSubmit: submitJestFn,
    onCancel: cancelJestFn,
  },
  argTypes: {
    onSubmit: { control: false },
    onCancel: { control: false },
  },
  decorators: [
    clearMocksDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    clearMocks: true,
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof RelationToOneFieldInputWithContext>;

export const Default: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
};

export const Submit: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    expect(submitJestFn).toHaveBeenCalledTimes(0);

    const item = await canvas.findByText('John Wick', undefined, {
      timeout: 3000,
    });

    await waitFor(() => {
      userEvent.click(item);
      expect(submitJestFn).toHaveBeenCalledTimes(1);
    });
  },
};

export const Cancel: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    expect(cancelJestFn).toHaveBeenCalledTimes(0);
    await canvas.findByText('John Wick', undefined, { timeout: 3000 });

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');

    await waitFor(() => {
      userEvent.click(emptyDiv);
      expect(cancelJestFn).toHaveBeenCalledTimes(1);
    });
  },
};
