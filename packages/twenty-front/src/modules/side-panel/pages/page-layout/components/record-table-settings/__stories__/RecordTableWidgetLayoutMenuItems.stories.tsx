import { RecordTableWidgetLayoutMenuItems } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableWidgetLayoutMenuItems';
import { getRecordTableWidgetLayoutPickerOptions } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutPickerOptions';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LightButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ViewType } from '~/generated-metadata/graphql';

const onSelect = fn();
const meta: Meta<typeof RecordTableWidgetLayoutMenuItems> = {
  title: 'Modules/SidePanel/PageLayout/RecordTableWidgetLayoutMenuItems',
  component: RecordTableWidgetLayoutMenuItems,
  decorators: [ComponentDecorator],
  args: {
    layoutOptions: getRecordTableWidgetLayoutPickerOptions({
      isKanbanAvailable: false,
      isCalendarAvailable: false,
    }),
    onSelect,
  },
  beforeEach: () => {
    onSelect.mockClear();
  },
  render: (args) => (
    <DropdownRoot dropdownId="unavailable-table-layout-story" type="picker">
      <Dropdown.Trigger render={<LightButton />}>Layout</Dropdown.Trigger>
      <DropdownContent>
        <Dropdown.Section>
          <Dropdown.SelectionGroup
            aria-label="Layout"
            value={ViewType.TABLE_WIDGET}
          >
            <RecordTableWidgetLayoutMenuItems
              layoutOptions={args.layoutOptions}
              onSelect={args.onSelect}
            />
          </Dropdown.SelectionGroup>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const UnavailableLayoutsStayDisabled: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole('button', { name: 'Layout' });
    await userEvent.click(trigger);
    const kanban = await body.findByRole('option', { name: /Kanban/ });
    const calendar = body.getByRole('option', { name: /Calendar/ });
    expect(kanban).toBeDisabled();
    expect(kanban).toHaveTextContent('Needs a Select field');
    expect(calendar).toBeDisabled();
    expect(calendar).toHaveTextContent('Needs a Date field');
    await userEvent.click(kanban);
    await userEvent.click(calendar);
    expect(onSelect).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(body.getByRole('option', { name: 'List' }));
    expect(onSelect).toHaveBeenCalledWith(ViewType.LIST_WIDGET);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
  },
};
