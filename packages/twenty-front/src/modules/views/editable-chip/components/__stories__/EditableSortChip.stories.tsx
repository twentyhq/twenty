import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SortViewDecorator } from '~/testing/decorators/SortViewDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { useEffect } from 'react';
import { EditableSortChip } from '@/views/editable-chip/components/EditableSortChip';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const SortChipExample = ({ fieldName = 'address' }: { fieldName?: string }) => {
  const [sorts, setSorts] = useAtomComponentState(
    currentRecordSortsComponentState,
  );
  const field = getMockObjectMetadataItemOrThrow('company').fields.find(
    (field) => field.name === fieldName,
  )!;
  useEffect(() => {
    setSorts([
      {
        id: 'chip-story',
        fieldMetadataId: field.id,
        direction: ViewSortDirection.ASC,
      },
    ]);
  }, [setSorts, field.id]);
  return (
    <>
      {sorts.map((sort) => (
        <EditableSortChip key={sort.id} recordSort={sort} />
      ))}
    </>
  );
};

const meta: Meta<typeof SortChipExample> = {
  title: 'Modules/Views/EditableSortChip',
  component: SortChipExample,
  decorators: [
    SortViewDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
    MemoryRouterDecorator,
  ],
};
export default meta;
type Story = StoryObj<typeof SortChipExample>;

export const CompositeField: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', { name: /Address/ });
    await userEvent.click(trigger);
    await expect(
      await body.findByRole('button', { name: 'Ascending' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(body.getByRole('button', { name: 'Descending' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await expect(
      await body.findByRole('button', { name: 'Descending' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(body.getByRole('button', { name: 'City' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveTextContent('City');
    await userEvent.click(canvas.getByTestId(/^remove-icon-/));
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Address')).not.toBeInTheDocument();
  },
};

export const SimpleField: Story = {
  args: { fieldName: 'name' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Name'));
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByTestId(/^remove-icon-/));
    await expect(canvas.queryByText('Name')).not.toBeInTheDocument();
  },
};
