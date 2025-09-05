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
import { RelationToOneFieldInput } from '../RelationToOneFieldInput';

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

type RelationToOneFieldInputWithContextProps = {
  value: number;
  recordId: string;
};

const RelationToOneFieldInputWithContext = ({
  recordId,
}: RelationToOneFieldInputWithContextProps) => {
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
            fieldMetadataId: 'relation',
            label: 'Relation',
            type: FieldMetadataType.RELATION,
            iconName: 'IconLink',
            metadata: {
              fieldName: 'Relation',
              relationObjectMetadataNamePlural: 'companies',
              relationObjectMetadataNameSingular:
                CoreObjectNameSingular.Company,
              relationObjectMetadataId: '20202020-8c37-4163-ba06-1dada334ce3e',
              objectMetadataNameSingular: 'person',
              relationFieldMetadataId: '20202020-8c37-4163-ba06-1dada334ce3e',
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

            <RelationToOneFieldInput />
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
  title: 'UI/Data/Field/Input/RelationToOneFieldInput',
  component: RelationToOneFieldInputWithContext,
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

type Story = StoryObj<typeof RelationToOneFieldInputWithContext>;

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
