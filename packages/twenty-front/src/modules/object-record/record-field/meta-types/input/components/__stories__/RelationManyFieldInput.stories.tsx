import { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInput';
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
          label: 'People',
          type: FieldMetadataType.Relation,
          iconName: 'IconLink',
          metadata: {
            fieldName: 'people',
            relationObjectMetadataNamePlural: 'companies',
            relationObjectMetadataNameSingular: CoreObjectNameSingular.Company,
            objectMetadataNameSingular: 'company',
            relationFieldMetadataId: '20202020-8c37-4163-ba06-1dada334ce3e',
          },
        }}
        recordId={'recordId'}
      >
        <RelationWorkspaceSetterEffect />
        <RelationFromManyFieldInput />
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
