import { Meta, StoryObj } from '@storybook/react';
import { useEffect, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInput';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/hooks/useOpenFieldInputEditMode';
import { FieldContextProvider } from '@/object-record/record-field/meta-types/components/FieldContextProvider';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from 'twenty-shared';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

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

  const fieldDefinition = useMemo(
    () => ({
      fieldMetadataId: 'relation',
      label: 'People',
      type: FieldMetadataType.RELATION,
      iconName: 'IconLink',
      metadata: {
        fieldName: 'people',
        relationType: RelationDefinitionType.ONE_TO_MANY,
        relationObjectMetadataNamePlural: 'companies',
        relationObjectMetadataNameSingular: CoreObjectNameSingular.Company,
        objectMetadataNameSingular: 'company',
        relationFieldMetadataId: '20202020-8c37-4163-ba06-1dada334ce3e',
      },
    }),
    [],
  );

  const setRecordStoreFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      fieldName: 'people',
      recordId: 'recordId',
    }),
  );

  const { openFieldInput } = useOpenFieldInputEditMode();

  useEffect(() => {
    setRecordStoreFieldValue([]);

    setHotKeyScope('hotkey-scope');
    openFieldInput({
      fieldDefinition,
      recordId: 'recordId',
    });
  }, [
    fieldDefinition,
    openFieldInput,
    setHotKeyScope,
    setRecordStoreFieldValue,
  ]);

  return (
    <div>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: 'relation-from-many-field-record-id-people',
        }}
      >
        <FieldContextProvider
          fieldDefinition={fieldDefinition}
          recordId={'recordId'}
        >
          <RelationWorkspaceSetterEffect />
          <RelationFromManyFieldInput />
        </FieldContextProvider>
      </RecordFieldComponentInstanceContext.Provider>
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
