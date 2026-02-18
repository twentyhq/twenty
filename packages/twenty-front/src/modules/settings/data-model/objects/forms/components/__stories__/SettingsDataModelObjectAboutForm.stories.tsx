import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { ComponentDecorator } from 'twenty-ui/testing';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

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
    FormProviderDecorator,
    IconsProviderDecorator,
    ComponentDecorator,
    MemoryRouterDecorator,
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
