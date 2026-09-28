import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';

import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { sleep } from '~/utils/sleep';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const firstCompanyRecord = mockedCompanyRecords[0];
assertIsDefinedOrThrow(firstCompanyRecord);

const companyView = mockedViews.find((v) => v.name === 'All Companies')!;

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTable',
  component: RecordTableWithWrappers,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    FileUploadDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ToastDecorator,
    ObjectMetadataItemsDecorator,
  ],
  args: {
    recordTableId: `companies-${companyView.id}`,
    viewBarId: 'view-bar',
    objectNameSingular: 'company',
  },
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordTableWithWrappers>;

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

export const HeaderMenuStaysOpenAfterMoveRight: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findAllByText('Linkedin', {}, { timeout: 3000 });

    const headerMenuButton = await canvas.findByText('Domain Name');
    await userEvent.click(headerMenuButton);

    const moveRightButton = await body.findByText('Move right');
    await userEvent.click(moveRightButton);

    await body.findByText('Move right');
  },
};

export const NestedCurrencyPickerPreservesCellEditMode: Story = {
  beforeEach: () => {
    const originalViewFields = companyView.viewFields;
    const [firstViewField] = originalViewFields;
    const [firstCompanyRecord] = mockedCompanyRecords;

    assertIsDefinedOrThrow(firstViewField);
    assertIsDefinedOrThrow(firstCompanyRecord);

    const originalCurrencyValue = firstCompanyRecord.annualRecurringRevenue;
    const currencyField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      fieldName: 'annualRecurringRevenue',
    });

    companyView.viewFields = [
      ...originalViewFields.map((viewField) => ({
        ...viewField,
        position: viewField.position === 0 ? 0 : viewField.position + 1,
      })),
      {
        ...firstViewField,
        id: 'currency-focus-story-field',
        fieldMetadataId: currencyField.id,
        position: 1,
      },
    ];
    firstCompanyRecord.annualRecurringRevenue = {
      amountMicros: 123_000_000,
      currencyCode: 'USD',
    };

    return () => {
      companyView.viewFields = originalViewFields;
      firstCompanyRecord.annualRecurringRevenue = originalCurrencyValue;
    };
  },
  render: (args) => (
    <>
      <Button>Outside table</Button>
      <RecordTableWithWrappers {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText(firstCompanyRecord?.name, {}, { timeout: 3000 });
    const amountDisplay = await canvas.findByText('123', {}, { timeout: 3000 });

    await userEvent.click(amountDisplay);

    const amountInput = await body.findByRole('textbox');

    await userEvent.click(await body.findByText('USD'));

    const picker = await body.findByRole('dialog', { name: 'Currency' });

    await expect(amountInput).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside table' }),
    );

    await waitFor(() => expect(picker).not.toBeInTheDocument());
    await expect(amountInput).toBeVisible();
    await expect(amountInput).toHaveValue('123');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside table' }),
    );

    await waitFor(() => expect(amountInput).not.toBeInTheDocument());
    await expect(amountDisplay).toBeVisible();
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
    await canvas.findAllByText(firstCompanyRecord?.name, {}, { timeout: 3000 });

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

    await canvas.findByText(mockedCompanyRecords[1]?.name);
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
    await canvas.findAllByText(firstCompanyRecord?.name, {}, { timeout: 3000 });

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

    await canvas.findByText(mockedCompanyRecords[1]?.name);
  },
};

export const MultiSelectPickerAnchorsToTableCell: Story = {
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('FindOneWorkspaceMember', ({ variables }) =>
          HttpResponse.json({
            data: {
              workspaceMember:
                mockedWorkspaceMemberRecords.find(
                  (workspaceMemberRecord) =>
                    workspaceMemberRecord.id === variables.objectRecordId,
                ) ?? null,
            },
          }),
        ),
      ],
    },
  },
  beforeEach: () => {
    const originalViewFields = companyView.viewFields;
    const [firstViewField] = originalViewFields;
    assertIsDefinedOrThrow(firstViewField);
    const originalWorkPolicy = firstCompanyRecord.workPolicy;
    const workPolicyField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      fieldName: 'workPolicy',
    });

    companyView.viewFields = [
      ...originalViewFields.map((viewField) => ({
        ...viewField,
        position: viewField.position === 0 ? 0 : viewField.position + 1,
      })),
      {
        ...firstViewField,
        id: 'work-policy-anchor-story-field',
        fieldMetadataId: workPolicyField.id,
        position: 1,
      },
    ];
    firstCompanyRecord.workPolicy = ['ON_SITE'];

    return () => {
      companyView.viewFields = originalViewFields;
      firstCompanyRecord.workPolicy = originalWorkPolicy;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText(firstCompanyRecord.name, {}, { timeout: 3000 });
    const [onSiteOption] = await canvas.findAllByText('On-Site');
    assertIsDefinedOrThrow(onSiteOption);
    await userEvent.click(onSiteOption);

    const picker = await body.findByRole('dialog', { name: 'Work Policy' });
    const anchor = canvas.getByTestId('editable-cell-edit-mode-container');

    await waitFor(() => {
      const anchorBounds = anchor.getBoundingClientRect();
      const pickerBounds = picker.getBoundingClientRect();

      expect(
        Math.abs(pickerBounds.left - (anchorBounds.left - 3)),
      ).toBeLessThan(2);
      expect(
        Math.abs(pickerBounds.top - (anchorBounds.bottom - 33)),
      ).toBeLessThan(2);
    });

    const search = within(picker).getByRole('searchbox', { name: 'Search' });

    await userEvent.type(search, 'Remote');
    await userEvent.keyboard('{Enter}');

    await expect(
      within(picker).getByRole('button', { name: 'Remote Work' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await userEvent.keyboard('{Enter}');

    await expect(
      within(picker).getByRole('button', { name: 'Remote Work' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await expect(picker).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
  },
};
