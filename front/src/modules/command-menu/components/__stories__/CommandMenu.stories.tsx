import { expect } from '@storybook/jest';
import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, userEvent, within } from '@storybook/testing-library';

enum CommandType {
  Navigate = 'Navigate',
  Create = 'Create',
}

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { sleep } from '~/testing/sleep';

import { WrapperCommandMenu } from '../WrapperCommandMenu';

const meta: Meta<typeof WrapperCommandMenu> = {
  title: 'Modules/CommandMenu/WrapperCommandMenu',
  component: () => (
    <WrapperCommandMenu
      companies={[
        {
          __typename: 'Company',
          accountOwner: null,
          address: '',
          createdAt: '2023-09-19T08:35:37.174Z',
          domainName: 'facebook.com',
          employees: null,
          linkedinUrl: null,
          xUrl: null,
          annualRecurringRevenue: null,
          idealCustomerProfile: false,
          id: 'twenty-118995f3-5d81-46d6-bf83-f7fd33ea6102',
          name: 'Facebook',
          _activityCount: 0,
        },
        {
          __typename: 'Company',
          accountOwner: null,
          address: '',
          createdAt: '2023-09-19T08:35:37.188Z',
          domainName: 'airbnb.com',
          employees: null,
          linkedinUrl: null,
          xUrl: null,
          annualRecurringRevenue: null,
          idealCustomerProfile: false,
          id: 'twenty-89bb825c-171e-4bcc-9cf7-43448d6fb278',
          name: 'Airbnb',
          _activityCount: 0,
        },
        {
          __typename: 'Company',
          accountOwner: null,
          address: '',
          createdAt: '2023-09-19T08:35:37.206Z',
          domainName: 'claap.io',
          employees: null,
          linkedinUrl: null,
          xUrl: null,
          annualRecurringRevenue: null,
          idealCustomerProfile: false,
          id: 'twenty-9d162de6-cfbf-4156-a790-e39854dcd4eb',
          name: 'Claap',
          _activityCount: 0,
        },
      ]}
      activities={[
        {
          __typename: 'Activity',
          id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400',
          title: 'Performance update',
          body: '[{"id":"555df0c3-ab88-4c62-abae-c9b557c37c5b","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"In the North American region, we have observed a strong growth rate of 18% in sales. Europe followed suit with a significant 14% increase, while Asia-Pacific sustained its performance with a steady 10% rise. Special kudos to the North American team for the excellent work done in penetrating new markets and establishing stronger footholds in the existing ones.","styles":{}}],"children":[]},{"id":"13530934-b3ce-4332-9238-3760aa4acb3e","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]',
        },
        {
          __typename: 'Activity',
          id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfc408',
          title: 'Buyout Proposal',
          body: '[{"id":"333df0c3-ab88-4c62-abae-c9b557c37c5b","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"We are considering the potential acquisition of [Company], a leading company in [Industry/Specific Technology]. This company has demonstrated remarkable success and pioneering advancements in their field, paralleling our own commitment to progress. By integrating their expertise with our own, we believe that we can amplify our growth, broaden our offerings, and fortify our position at the forefront of technology. This prospective partnership could help to ensure our continued leadership in the industry and allow us to deliver even more innovative solutions for our customers.","styles":{}}],"children":[]},{"id":"13530934-b3ce-4332-9238-3760aa4acb3e","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]',
        },
      ]}
      values={[
        {
          to: '/people',
          label: 'Go to People',
          type: CommandType.Navigate,
          shortcuts: ['G', 'P'],
        },
        {
          to: '/companies',
          label: 'Go to Companies',
          type: CommandType.Navigate,
          shortcuts: ['G', 'C'],
        },
        {
          to: '/opportunities',
          label: 'Go to Opportunities',
          type: CommandType.Navigate,
          shortcuts: ['G', 'O'],
        },
        {
          to: '/settings/profile',
          label: 'Go to Settings',
          type: CommandType.Navigate,
          shortcuts: ['G', 'S'],
        },
        {
          to: '/tasks',
          label: 'Go to Tasks',
          type: CommandType.Navigate,
          shortcuts: ['G', 'T'],
        },
        {
          to: '',
          label: 'Create Task',
          type: CommandType.Create,
        },
      ]}
      people={[
        {
          __typename: 'Person',
          id: 'twenty-0aa00beb-ac73-4797-824e-87a1f5aea9e0',
          phone: '+33780123456',
          email: 'sylvie.palmer@linkedin.com',
          city: 'Los Angeles',
          firstName: 'Sylvie',
          lastName: 'Palmer',
          displayName: 'Sylvie Palmer',
          avatarUrl: null,
          createdAt: '2023-09-19T08:35:37.240Z',
        },
        {
          __typename: 'Person',
          id: 'twenty-1d151852-490f-4466-8391-733cfd66a0c8',
          phone: '+33782345678',
          email: 'isabella.scott@microsoft.com',
          city: 'New York',
          firstName: 'Isabella',
          lastName: 'Scott',
          displayName: 'Isabella Scott',
          avatarUrl: null,
          createdAt: '2023-09-19T08:35:37.257Z',
        },
        {
          __typename: 'Person',
          id: 'twenty-240da2ec-2d40-4e49-8df4-9c6a049190df',
          phone: '+33788901234',
          email: 'bertrand.voulzy@google.com',
          city: 'Seattle',
          firstName: 'Bertrand',
          lastName: 'Voulzy',
          displayName: 'Bertrand Voulzy',
          avatarUrl: null,
          createdAt: '2023-09-19T08:35:37.291Z',
        },
      ]}
    />
  ),
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof WrapperCommandMenu>;

export const defaultWithoutSearch: Story = {
  play: async ({ canvasElement }) => {
    fireEvent.keyDown(canvasElement, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
    });
    await sleep(50);
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(10);
    await userEvent.type(searchInput, '');
    expect(await canvas.findByText('Create Task')).toBeInTheDocument();
    expect(await canvas.findByText('Go to People')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Companies')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Opportunities')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Settings')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Tasks')).toBeInTheDocument();
  },
};

export const matchingPersonCompanyActivityCreateNavigate: Story = {
  play: async ({ canvasElement }) => {
    fireEvent.keyDown(canvasElement, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
    });
    await sleep(50);
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(10);
    await userEvent.type(searchInput, 'a');
    expect(await canvas.findByText('Isabella Scott')).toBeInTheDocument();
    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();
    expect(await canvas.findByText('Buyout Proposal')).toBeInTheDocument();
    expect(await canvas.findByText('Create Task')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Tasks')).toBeInTheDocument();
  },
};

export const onlyMatchingCreateAndNavigate: Story = {
  play: async ({ canvasElement }) => {
    fireEvent.keyDown(canvasElement, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
    });
    await sleep(50);
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(10);
    await userEvent.type(searchInput, 'tas');
    expect(await canvas.findByText('Create Task')).toBeInTheDocument();
    expect(await canvas.findByText('Go to Tasks')).toBeInTheDocument();
  },
};

export const atleastMatchingOnePerson: Story = {
  play: async ({ canvasElement }) => {
    fireEvent.keyDown(canvasElement, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
    });
    await sleep(50);
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(10);
    await userEvent.type(searchInput, 'sy');
    expect(await canvas.findByText('Sylvie Palmer')).toBeInTheDocument();
  },
};

export const notMatchingAnything: Story = {
  play: async ({ canvasElement }) => {
    fireEvent.keyDown(canvasElement, {
      key: 'k',
      code: 'KeyK',
      metaKey: true,
    });
    await sleep(50);
    const canvas = within(document.body);
    const searchInput = await canvas.findByPlaceholderText('Search');
    await sleep(10);
    await userEvent.type(searchInput, 'asdasdasd');
    expect(await canvas.findByText('No results found.')).toBeInTheDocument();
  },
};
