import { type Meta, type StoryObj } from '@storybook/react';
import { useEffect, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { RelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RelationOneToManyFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

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

const RelationOneToManyFieldInputWithContext = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const fieldDefinition = useMemo(
    () => ({
      fieldMetadataId: 'e82262eb-7f58-4167-a23c-fc51ec584d1b',
      label: 'People',
      type: FieldMetadataType.RELATION,
      iconName: 'IconLink',
      metadata: {
        fieldName: 'people',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNamePlural: 'companies',
        relationObjectMetadataNameSingular: CoreObjectNameSingular.Company,
        objectMetadataNameSingular: 'person',
        relationFieldMetadataId: '3c211c59-02a1-4904-ad0f-5bb30b736461',
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
          <RelationOneToManyFieldInput />
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
      <div data-testid="data-field-input-click-outside-div" />
    </div>
  );
};
const meta: Meta = {
  title: 'UI/Data/Field/Input/RelationOneToManyFieldInput',
  component: RelationOneToManyFieldInputWithContext,
  args: {},
  decorators: [
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    I18nFrontDecorator,
  ],
  parameters: {
    clearMocks: true,
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof RelationOneToManyFieldInputWithContext>;

export const Default: Story = {};
