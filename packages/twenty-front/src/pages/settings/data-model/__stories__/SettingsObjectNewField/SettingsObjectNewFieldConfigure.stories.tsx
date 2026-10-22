import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SettingsObjectNewFieldConfigure } from '~/pages/settings/data-model/new-field/SettingsObjectNewFieldConfigure';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  type CreateOneFieldMetadataItemMutation,
  type CreateOneFieldMetadataItemMutationVariables,
  MetadataWritability,
} from '~/generated-metadata/graphql';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/DataModel/SettingsObjectNewField/SettingsObjectNewFieldConfigure',
  component: SettingsObjectNewFieldConfigure,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural/new-field/configure',
    routeParams: { ':objectNamePlural': 'companies' },
    additionalRoutes: ['/settings/objects/companies'],
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation<
          CreateOneFieldMetadataItemMutation,
          CreateOneFieldMetadataItemMutationVariables
        >('CreateOneFieldMetadataItem', ({ variables }) => {
          const fieldMetadataItem = getMockFieldMetadataItemOrThrow({
            objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
            fieldName: 'name',
          });

          return HttpResponse.json({
            data: {
              createOneField: {
                ...fieldMetadataItem,
                ...variables.input.field,
                __typename: 'Field',
                id: '20202020-0000-4000-8000-000000000001',
                applicationId: fieldMetadataItem.applicationId ?? '',
                writability: MetadataWritability.OPEN,
                object: {
                  __typename: 'Object',
                  id: variables.input.field.objectMetadataId,
                },
                relation: null,
                morphRelations: null,
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewFieldConfigure>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('2. Configure field');

    const employeeInput = await canvas.findByPlaceholderText('Employees');
    await userEvent.type(employeeInput, 'Test');

    const saveButton = await canvas.findByRole('button', { name: 'Save' });
    await userEvent.tab();
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);
    await expect(
      await canvas.findByText('Navigated to /settings/objects/companies'),
    ).toBeVisible();
  },
};
