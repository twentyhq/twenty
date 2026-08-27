import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { SidePanelRecordInfo } from '@/side-panel/components/SidePanelRecordInfo';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { beautifyExactDateTime } from '~/utils/date-utils';

const SIDE_PANEL_PAGE_INSTANCE_ID = 'side-panel-record-info';
const CREATED_AT = '2026-08-25T12:00:00.000Z';
const COMPANY = {
  ...mockedCompanyRecords[0],
  name: 'Acme',
  createdAt: CREATED_AT,
};

const meta: Meta<typeof SidePanelRecordInfo> = {
  title: 'Modules/SidePanel/SidePanelRecordInfo',
  component: SidePanelRecordInfo,
  args: { sidePanelPageInstanceId: SIDE_PANEL_PAGE_INSTANCE_ID },
  parameters: {
    mockingDate: new Date('2026-08-27T12:00:00.000Z'),
    records: [COMPANY],
  },
  decorators: [
    (Story) => {
      jotaiStore.set(
        viewableRecordIdComponentState.atomFamily({
          instanceId: SIDE_PANEL_PAGE_INSTANCE_ID,
        }),
        COMPANY.id,
      );
      jotaiStore.set(
        viewableRecordNameSingularComponentState.atomFamily({
          instanceId: SIDE_PANEL_PAGE_INSTANCE_ID,
        }),
        'company',
      );
      return <Story />;
    },
    RecordStoreDecorator,
    ObjectMetadataItemsDecorator,
    ComponentWithRouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SidePanelRecordInfo>;

export const Editable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('heading', { level: 3, name: 'Acme' }),
    ).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: 'Acme' }),
    ).not.toBeInTheDocument();

    await userEvent.hover(await canvas.findByText('Created 2 days ago'));
    expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(beautifyExactDateTime(CREATED_AT));
    await userEvent.unhover(canvas.getByText('Created 2 days ago'));
  },
};

export const ReadOnly: Story = {
  beforeEach: () => {
    jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('link', { name: 'Acme' })).toHaveAttribute(
      'href',
      `/object/company/${COMPANY.id}`,
    );
  },
};

export const WithoutCreationDate: Story = {
  parameters: { records: [{ ...COMPANY, createdAt: null }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('heading', { level: 3, name: 'Acme' }),
    ).toBeVisible();
    expect(canvas.queryByText(/^Created /)).not.toBeInTheDocument();
  },
};
