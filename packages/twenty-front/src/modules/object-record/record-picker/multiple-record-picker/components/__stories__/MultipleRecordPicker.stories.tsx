import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { MultipleRecordPickerCreationStory } from '@/object-record/record-picker/multiple-record-picker/components/__stories__/MultipleRecordPickerCreationStory';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPANY_METADATA = getMockObjectMetadataItemOrThrow('company');
const COMPANY_RECORD = mockedCompanyRecords[0];
const CREATED_COMPANY_LABEL_PATTERN = new RegExp(String(COMPANY_RECORD.name));
const CREATED_MORPH_ITEM: RecordPickerPickableMorphItem = {
  recordId: COMPANY_RECORD.id,
  objectMetadataId: COMPANY_METADATA.id,
  isSelected: true,
  isMatchingSearchFilter: true,
};
const createRecord = fn(async () => CREATED_MORPH_ITEM);

const meta: Meta<typeof MultipleRecordPickerCreationStory> = {
  title: 'UI/RecordPicker/MultipleRecordPicker',
  component: MultipleRecordPickerCreationStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  parameters: { msw: graphqlMocks },
  args: { onCreate: createRecord },
};

export default meta;
type Story = StoryObj<typeof MultipleRecordPickerCreationStory>;

export const CreateTargetAndSession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Link records' });

    await userEvent.click(trigger);

    const picker = await body.findByRole('dialog', { name: 'Related records' });
    const search = within(picker).getByRole('searchbox');

    await userEvent.type(search, 'New company');
    await userEvent.click(
      within(picker).getByRole('button', { name: 'Add New' }),
    );

    expect(
      await within(picker).findByText('Select a record type'),
    ).toBeVisible();
    expect(within(picker).queryByRole('searchbox')).not.toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    const addNewButton = await within(picker).findByRole('button', {
      name: 'Add New',
    });

    await waitFor(() => expect(addNewButton).toHaveFocus());
    expect(search).toHaveValue('New company');
    expect(picker).toBeVisible();

    await userEvent.click(addNewButton);

    const finishCreation = fn<() => void>();
    const pendingCreation = new Promise<RecordPickerPickableMorphItem>(
      (resolve) => {
        finishCreation.mockImplementation(() => resolve(CREATED_MORPH_ITEM));
      },
    );
    createRecord.mockReturnValueOnce(pendingCreation);

    await userEvent.dblClick(
      await within(picker).findByRole('button', {
        name: COMPANY_METADATA.labelSingular,
      }),
    );

    expect(createRecord).toHaveBeenCalledTimes(1);
    expect(createRecord).toHaveBeenCalledWith({
      searchInput: 'New company',
      objectMetadataItemId: COMPANY_METADATA.id,
    });
    expect(within(picker).getByText('Select a record type')).toBeVisible();

    finishCreation();

    expect(await within(picker).findByRole('searchbox')).toHaveValue(
      'New company',
    );
    expect(
      await within(picker).findByRole('option', {
        name: CREATED_COMPANY_LABEL_PATTERN,
        selected: true,
      }),
    ).toBeVisible();
    expect(picker).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Related records' }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);

    const reopenedPicker = await body.findByRole('dialog', {
      name: 'Related records',
    });

    expect(within(reopenedPicker).getByRole('searchbox')).toHaveValue('');
    expect(
      within(reopenedPicker).getByRole('button', { name: 'Add New' }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside picker' }),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Related records' }),
      ).not.toBeInTheDocument(),
    );
  },
};
