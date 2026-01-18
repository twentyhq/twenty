import { type Meta, type StoryObj } from '@storybook/react-vite';

import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { type RecordTableEmptyStateNoGroupNoRecordAtAll } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateNoGroupNoRecordAtAll';
import { fireEvent, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedViewsData } from '~/testing/mock-data/views';
import { sleep } from '~/utils/sleep';

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTable',
  component: RecordTableWithWrappers,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    SnackBarDecorator,
    ObjectMetadataItemsDecorator,
  ],
  args: {
    recordTableId: `companies-${mockedViewsData[0].id}`,
    viewBarId: 'view-bar',
    objectNameSingular: 'company',
  },
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordTableEmptyStateNoGroupNoRecordAtAll>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Linkedin', {}, { timeout: 3000 });
  },
};

export const HeaderMenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await canvas.findAllByText('Linkedin', {}, { timeout: 3000 });

    const headerMenuButton = await canvas.findByText('Domain Name');

    await userEvent.click(headerMenuButton);

    await body.findByText('Move right');
  },
};

export const ScrolledLeft: Story = {
  parameters: {
    container: {
      width: 1000,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findAllByText('Linkedin', {}, { timeout: 3000 });

    const scrollWrapper = canvasElement.ownerDocument.body.querySelector(
      '.scroll-wrapper-x-enabled',
    );

    if (!scrollWrapper) {
      throw new Error('Scroll wrapper not found');
    }

    await sleep(1000);

    fireEvent.scroll(scrollWrapper, {
      target: {
        scrollLeft: 100,
      },
    });

    await canvas.findByText('Facebook');
  },
};

export const ScrolledBottom: Story = {
  parameters: {
    container: {
      height: 300,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findAllByText('Linkedin', {}, { timeout: 3000 });

    const scrollWrapper = canvasElement.ownerDocument.body.querySelector(
      '.scroll-wrapper-y-enabled',
    );

    if (!scrollWrapper) {
      throw new Error('Scroll wrapper not found');
    }

    await sleep(1000);

    fireEvent.scroll(scrollWrapper, {
      target: {
        scrollTop: 80,
      },
    });

    await canvas.findByText('Facebook');
  },
};
