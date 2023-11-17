import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { Field, FieldMetadataType } from '~/generated-metadata/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import {
  mockedCompaniesMetadata,
  mockedWorkspacesMetadata,
} from '~/testing/mock-data/metadata';

import { SettingsObjectFieldPreview } from '../SettingsObjectFieldPreview';

const meta: Meta<typeof SettingsObjectFieldPreview> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldPreview',
  component: SettingsObjectFieldPreview,
  decorators: [ComponentDecorator],
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Text,
    )?.node as Field,
    objectMetadataId: mockedCompaniesMetadata.node.id,
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
      ({ node }) => node.type === FieldMetadataType.Date,
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

export const Relation: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Relation,
    )?.node as Field,
  },
};

export const CustomObject: Story = {
  args: {
    fieldMetadata: mockedCompaniesMetadata.node.fields.edges.find(
      ({ node }) => node.type === FieldMetadataType.Text,
    )?.node as Field,
    objectMetadataId: mockedWorkspacesMetadata.node.id,
  },
};
