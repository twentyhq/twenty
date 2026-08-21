import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isNonEmptyString } from '@sniptt/guards';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MenuItem } from 'twenty-ui/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';

const ITEM_LABELS = [
  'Content Marketing',
  'Growth Hacking',
  'Search Engine',
  'Viral Marketing',
];

const focusId = 'selectable-list-story';

type RenderProps = {
  onEnter: (itemLabel: string) => void;
  shouldPreselectFirstItem?: boolean;
};

const Render = ({ onEnter, shouldPreselectFirstItem }: RenderProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId,
      component: {
        type: FocusComponentType.DROPDOWN,
        instanceId: focusId,
      },
    });
  }, [pushFocusItemToFocusStack]);

  const filteredItemLabels = ITEM_LABELS.filter((itemLabel) =>
    itemLabel.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <SelectableList
      selectableListInstanceId={focusId}
      selectableItemIdArray={filteredItemLabels}
      focusId={focusId}
      shouldPreselectFirstItem={
        shouldPreselectFirstItem ?? isNonEmptyString(searchFilter)
      }
    >
      <input
        aria-label="Search"
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.currentTarget.value)}
        autoFocus
      />
      {filteredItemLabels.map((itemLabel) => (
        <SelectableListItem
          key={itemLabel}
          itemId={itemLabel}
          onEnter={() => onEnter(itemLabel)}
        >
          <MenuItem text={itemLabel} />
        </SelectableListItem>
      ))}
    </SelectableList>
  );
};

const meta: Meta<typeof Render> = {
  title: 'UI/Layout/SelectableList/SelectableList',
  component: Render,
  decorators: [ComponentDecorator],
  args: {
    onEnter: fn(),
  },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof Render>;

export const PreselectsFirstMatchingItem: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByLabelText('Search'), 'marketing');

    await waitFor(() => {
      expect(canvas.queryByText('Growth Hacking')).not.toBeInTheDocument();
    });

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(args.onEnter).toHaveBeenCalledWith('Content Marketing');
    });
  },
};

export const KeepsSelectedItemWhileItStillMatches: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = await canvas.findByLabelText('Search');

    await userEvent.type(searchInput, 'ar');

    await waitFor(() => {
      expect(canvas.getByText('Search Engine')).toBeVisible();
    });

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.type(searchInput, 'k');

    await waitFor(() => {
      expect(canvas.queryByText('Search Engine')).not.toBeInTheDocument();
    });

    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(args.onEnter).toHaveBeenCalledWith('Viral Marketing');
    });
  },
};

export const SelectsNothingWithoutMatchingItem: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByLabelText('Search'), 'xyz123');

    await waitFor(() => {
      expect(canvas.queryByText('Content Marketing')).not.toBeInTheDocument();
    });

    await userEvent.keyboard('{Enter}');

    expect(args.onEnter).not.toHaveBeenCalled();
  },
};

export const SelectsNothingWithoutPreselection: Story = {
  args: {
    shouldPreselectFirstItem: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByLabelText('Search'), 'marketing');

    await waitFor(() => {
      expect(canvas.queryByText('Growth Hacking')).not.toBeInTheDocument();
    });

    await userEvent.keyboard('{Enter}');

    expect(args.onEnter).not.toHaveBeenCalled();
  },
};
