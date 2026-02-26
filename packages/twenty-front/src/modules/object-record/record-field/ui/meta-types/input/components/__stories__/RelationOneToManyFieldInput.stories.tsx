import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
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
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personMetadata = getMockObjectMetadataItemOrThrow('person');
const companyMetadata = getMockObjectMetadataItemOrThrow('company');
const companyFieldOnPerson = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personMetadata,
  fieldName: 'company',
});
const peopleFieldOnCompany = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyMetadata,
  fieldName: 'people',
});

const RelationWorkspaceSetterEffect = () => {
  useEffect(() => {
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
  }, []);

  return <></>;
};

const RelationOneToManyFieldInputWithContext = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const fieldDefinition = useMemo(
    () => ({
      fieldMetadataId: peopleFieldOnCompany.id,
      label: 'People',
      type: FieldMetadataType.RELATION,
      iconName: 'IconLink',
      metadata: {
        fieldName: 'people',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNamePlural: 'people',
        relationObjectMetadataNameSingular: CoreObjectNameSingular.Person,
        objectMetadataNameSingular: 'company',
        relationFieldMetadataId: companyFieldOnPerson.id,
      },
    }),
    [],
  );

  const setRecordStoreFieldValue = useSetAtom(
    recordStoreFamilySelector.selectorFamily({
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
    FileUploadDecorator,
  ],
  parameters: {
    clearMocks: true,
    msw: graphqlMocks,
  },
};

export default meta;

type Story = StoryObj<typeof RelationOneToManyFieldInputWithContext>;

export const Default: Story = {};
