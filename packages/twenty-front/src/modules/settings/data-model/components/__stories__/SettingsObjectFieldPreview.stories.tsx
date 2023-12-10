import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { Field, FieldMetadataType } from '~/generated-metadata/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockedCompaniesMetadata,
  mockedPeopleMetadata,
  mockedWorkspacesMetadata,
} from '~/testing/mock-data/metadata';

import { SettingsObjectFieldPreview } from '../SettingsObjectFieldPreview';

const meta: Meta<typeof SettingsObjectFieldPreview> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldPreview',
  component: SettingsObjectFieldPreview,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <ObjectMetadataItemsProvider>
          <Story />
        </ObjectMetadataItemsProvider>
      </SnackBarProviderScope>
    ),
  ],
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Text,
    )?.node,
    objectMetadataId: mockedCompaniesMetadata.node.id,
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldPreview>;

export const Text: Story = {};

export const Boolean: Story = {
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Boolean,
    )?.node as Field,
  },
};

export const Currency: Story = {
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Currency,
    )?.node as Field,
  },
};

export const Date: Story = {
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.DateTime,
    )?.node as Field,
  },
};

export const Link: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Link,
    )?.node as Field,
  },
};

export const Number: Story = {
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Number,
    )?.node as Field,
  },
};

export const Rating: Story = {
  args: {
    fieldMetadata: {
      icon: 'IconHandClick',
      label: 'Engagement',
      type: FieldMetadataType.Rating,
    },
  },
};

export const Relation: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    fieldMetadata: mockedPeopleMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Relation,
    )?.node as Field,
    objectMetadataId: mockedPeopleMetadata.node.id,
    relationObjectMetadataId: mockedCompaniesMetadata.node.id,
  },
};

export const CustomObject: Story = {
  args: {
    fieldMetadata: mockedWorkspacesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Text,
    )?.node as Field,
    objectMetadataId: mockedWorkspacesMetadata.node.id,
  },
};
