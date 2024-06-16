import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RelationManyFieldInput } from '@/object-record/record-field/meta-types/input/components/RelationManyFieldInput';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { FieldMetadataType } from '~/generated/graphql';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockDefaultWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { FieldContextProvider } from '../../../__stories__/FieldContextProvider';

const RelationWorkspaceSetterEffect = () => {
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  useEffect(() => {
    setCurrentWorkspace(mockDefaultWorkspace);
    setCurrentWorkspaceMember(mockedWorkspaceMemberData);
  }, [setCurrentWorkspace, setCurrentWorkspaceMember]);

  return <></>;
};

const RelationManyFieldInputWithContext = () => {
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
        entityId={'entityId'}
      >
        <RelationWorkspaceSetterEffect />
        <RelationManyFieldInput />
      </FieldContextProvider>
      <div data-testid="data-field-input-click-outside-div" />
    </div>
  );
};
const meta: Meta = {
  title: 'UI/Data/Field/Input/RelationManyFieldInput',
  component: RelationManyFieldInputWithContext,
  args: {},
  decorators: [ObjectMetadataItemsDecorator, SnackBarDecorator],
  parameters: {
    clearMocks: true,
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof RelationManyFieldInputWithContext>;

export const Default: Story = {
  decorators: [ComponentWithRecoilScopeDecorator],
};
