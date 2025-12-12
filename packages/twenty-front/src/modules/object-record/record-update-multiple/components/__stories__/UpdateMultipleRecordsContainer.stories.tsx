import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { UpdateMultipleRecordsContainer } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsContainer';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import gql from 'graphql-tag';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const UPDATE_MANY_COMPANIES_MUTATION = gql`
  mutation UpdateManyCompanies(
    $filter: CompanyFilterInput!
    $data: CompanyUpdateInput!
  ) {
    updateManyCompanies(filter: $filter, data: $data) {
      id
    }
  }
`;

const mocks = [
  {
    request: {
      query: UPDATE_MANY_COMPANIES_MUTATION,
      variables: {
        filter: { id: { in: ['1'] } }, // Assuming filter setup
        data: { name: 'New Name' },
      },
    },
    result: {
      data: {
        updateManyCompanies: [{ id: '1', __typename: 'Company' }],
      },
    },
  },
];

const mockLink = new MockLink(mocks);
const mockApolloCoreClient = new ApolloClient({
  link: mockLink,
  cache: new InMemoryCache({ addTypename: false }),
});

const meta: Meta<typeof UpdateMultipleRecordsContainer> = {
  title:
    'Modules/ObjectRecord/RecordUpdateMultiple/Components/UpdateMultipleRecordsContainer',
  component: UpdateMultipleRecordsContainer,
  decorators: [
    (Story) => (
      <ApolloCoreClientContext.Provider value={mockApolloCoreClient}>
        <ActionMenuContext.Provider value={{
             actions: [],
             actionMenuType: 'index-page-action-menu-dropdown',
             displayType: 'dropdownItem',
             isInRightDrawer: true,
        }}>
            <Story />
        </ActionMenuContext.Provider>
      </ApolloCoreClientContext.Provider>
    ),
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    I18nFrontDecorator,
    RootDecorator,
  ],
  args: {
    objectNameSingular: 'company',
    contextStoreInstanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
  },
  parameters: {
    contextStore: {
      componentInstanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    },
  },
};

export default meta;

type Story = StoryObj<typeof UpdateMultipleRecordsContainer>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for form to load (metadata loaded)
    const nameInput = await canvas.findByLabelText('Name', {}, { timeout: 5000 });

    // Type new value
    await userEvent.type(nameInput, 'New Name');

    // Click Apply
    const applyButton = await canvas.findByRole('button', { name: /Apply/i });
    await userEvent.click(applyButton);
  },
};
