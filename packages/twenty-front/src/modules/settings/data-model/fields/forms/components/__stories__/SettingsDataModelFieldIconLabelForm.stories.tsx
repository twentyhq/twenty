import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';

import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';

import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';

const StyledContainer = styled.div`
  flex: 1;
`;

const meta: Meta<typeof SettingsDataModelFieldIconLabelForm> = {
  title: 'Modules/Settings/DataModel/SettingsDataModelFieldIconLabelForm',
  component: SettingsDataModelFieldIconLabelForm,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    FormProviderDecorator,
    IconsProviderDecorator,
    ComponentDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldIconLabelForm>;

export const Default: Story = {};

const mockedPersonObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.namePlural === 'person',
);

export const WithFieldMetadataItem: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem?.fields.find(
      ({ name }) => name === 'name',
    ),
  },
};

export const Disabled: Story = {
  args: {},
};

export const WithMaxLength: Story = {
  args: {
    maxLength: 50,
  },
};
