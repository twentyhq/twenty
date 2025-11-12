import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { FieldMetadataType } from 'twenty-shared/types';
import { getCanvasElementForDropdownTesting } from 'twenty-ui/testing';

import { RelationManyToOneFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/RelationManyToOneFieldInput';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getFieldInputEventContextProviderWithJestMocks } from './utils/getFieldInputEventContextProviderWithJestMocks';

const RelationWorkspaceSetterEffect = () => {
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setRecordFieldInputLayoutDirectionLoading = useSetRecoilComponentState(
    recordFieldInputLayoutDirectionLoadingComponentState,
    'relation-to-one-field-input-123-Relation',
  );

  useEffect(() => {
    setCurrentWorkspace(mockCurrentWorkspace);
    setCurrentWorkspaceMember(mockedWorkspaceMemberData);
    setRecordFieldInputLayoutDirectionLoading(false);
  }, [
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setRecordFieldInputLayoutDirectionLoading,
  ]);

  return <></>;
};

const {
  FieldInputEventContextProviderWithJestMocks,
  handleSubmitMocked,
  handleCancelMocked,
} = getFieldInputEventContextProviderWithJestMocks();

type RelationManyToOneFieldInputWithContextProps = {
  value: number;
  recordId: string;
};

const RelationManyToOneFieldInputWithContext = ({
  recordId,
}: RelationManyToOneFieldInputWithContextProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: 'relation-to-one-field-input',
      component: {
        type: FocusComponentType.DROPDOWN,
        instanceId: 'relation-to-one-field-input',
      },
    });
  }, [pushFocusItemToFocusStack]);

  return (
    <div>
      <FieldContext.Provider
        value={{
          fieldDefinition: {
            fieldMetadataId: 'e82262eb-7f58-4167-a23c-fc51ec584d1b',
            label: 'Relation',
            type: FieldMetadataType.RELATION,
            iconName: 'IconLink',
            metadata: {
              fieldName: 'Relation',
              relationObjectMetadataNamePlural: 'companies',
              relationObjectMetadataNameSingular:
                CoreObjectNameSingular.Company,
              relationObjectMetadataId: '4a45f524-b8cb-40e8-8450-28e402b442cf',
              objectMetadataNameSingular: 'person',
              relationFieldMetadataId: '3c211c59-02a1-4904-ad0f-5bb30b736461',
            },
          },
          recordId: recordId,
          isLabelIdentifier: false,
          isRecordFieldReadOnly: false,
        }}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: 'relation-to-one-field-input-123-Relation',
          }}
        >
          <FieldInputEventContextProviderWithJestMocks>
            <RelationWorkspaceSetterEffect />

            <RelationManyToOneFieldInput />
          </FieldInputEventContextProviderWithJestMocks>
        </RecordFieldComponentInstanceContext.Provider>
      </FieldContext.Provider>
      <div data-testid="data-field-input-click-outside-div" />
    </div>
  );
};

const clearMocksDecorator: Decorator = (Story, context) => {
  if (context.parameters.clearMocks === true) {
    handleSubmitMocked.mockClear();
    handleCancelMocked.mockClear();
  }
  return <Story />;
};

const meta: Meta = {
  title: 'UI/Data/Field/Input/RelationManyToOneFieldInput',
  component: RelationManyToOneFieldInputWithContext,
  args: {
    useEditButton: true,
    onSubmit: handleSubmitMocked,
    onCancel: handleCancelMocked,
  },
  argTypes: {
    onSubmit: { control: false },
    onCancel: { control: false },
  },
  decorators: [
    clearMocksDecorator,
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

type Story = StoryObj<typeof RelationManyToOneFieldInputWithContext>;

export const Default: Story = {};

export const Submit: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    expect(handleSubmitMocked).toHaveBeenCalledTimes(0);

    const item = await canvas.findByText('Linkedin', undefined, {
      timeout: 3000,
    });

    await userEvent.click(item);

    await waitFor(() => {
      expect(handleSubmitMocked).toHaveBeenCalledTimes(1);
    });
  },
};

export const Cancel: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    expect(handleCancelMocked).toHaveBeenCalledTimes(0);
    await canvas.findByText('Linkedin', undefined, { timeout: 3000 });

    const emptyDiv = canvas.getByTestId('data-field-input-click-outside-div');

    await userEvent.click(emptyDiv);
    expect(handleCancelMocked).toHaveBeenCalledTimes(1);
  },
};
