import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';

import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { SettingsDataModelObjectAboutForm } from '../SettingsDataModelObjectAboutForm';
import { ComponentDecorator } from 'twenty-ui/testing';

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const StyledContainer = styled.div`
  flex: 1;
`;

const meta: Meta<typeof SettingsDataModelObjectAboutForm> = {
  title:
    'Modules/Settings/DataModel/Objects/Forms/SettingsDataModelObjectAboutForm',
  component: SettingsDataModelObjectAboutForm,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    I18nFrontDecorator,
    FormProviderDecorator,
    IconsProviderDecorator,
    ComponentDecorator,
  ],
  parameters: {
    container: { width: 520 },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelObjectAboutForm>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    objectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};
