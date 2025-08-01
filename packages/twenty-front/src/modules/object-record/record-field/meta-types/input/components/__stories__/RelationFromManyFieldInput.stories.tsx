import { Meta, StoryObj } from '@storybook/react';
import { useEffect, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInput';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/hooks/useOpenFieldInputEditMode';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

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
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const fieldDefinition = useMemo(
    () => ({
      fieldMetadataId: 'relation',
      label: 'People',
      type: FieldMetadataType.RELATION,
      iconName: 'IconLink',
      metadata: {
        fieldName: 'people',
        relationType: RelationType.ONE_TO_MANY,
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

    pushFocusItemToFocusStack({
      focusId: 'relation-from-many-field-input',
      component: {
        type: FocusComponentType.OPENED_FIELD_INPUT,
        instanceId: 'relation-from-many-field-input',
      },
    });
    openFieldInput({
      fieldDefinition,
      recordId: 'recordId',
    });
  }, [
    fieldDefinition,
    openFieldInput,
    pushFocusItemToFocusStack,
    setRecordStoreFieldValue,
  ]);

  return (
    <div>
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: 'relation-from-many-field-input',
        }}
      >
        <FieldContext.Provider
          value={{
            fieldDefinition,
            recordId: 'recordId',
            isLabelIdentifier: false,
            isRecordFieldReadOnly: false,
          }}
        >
          <RelationWorkspaceSetterEffect />
          <RelationFromManyFieldInput />
        </FieldContext.Provider>
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

export const Default: Story = {};
