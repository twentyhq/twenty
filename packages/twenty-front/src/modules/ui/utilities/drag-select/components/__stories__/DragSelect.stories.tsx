import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { useRef, useState } from 'react';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';

const StyledContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 400px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(4)};
  position: relative;
  width: 600px;
`;

const StyledSelectableItem = styled.div<{ selected?: boolean }>`
  width: 100px;
  height: 80px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme, selected }) =>
    selected ? theme.color.blue3 : theme.background.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  cursor: pointer;

  &:hover {
    background: ${({ theme, selected }) =>
      selected ? theme.color.blue5 : theme.background.tertiary};
  }
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  height: 100%;
`;

const StyledLargeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
  width: 900px;
  height: 600px;
`;

const StyledScrollableWrapper = styled(ScrollWrapper)`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 300px;
  width: 600px;
`;

type SelectableItemProps = {
  id: string;
  selected: boolean;
  children: React.ReactNode;
};

const SelectableItem = ({ id, selected, children }: SelectableItemProps) => (
  <StyledSelectableItem data-selectable-id={id} selected={selected}>
    {children}
  </StyledSelectableItem>
);

type BasicDragSelectDemoProps = {
  itemCount?: number;
  disableSelection?: boolean;
};

const BasicDragSelectDemo = ({
  itemCount = 12,
  disableSelection = false,
}: BasicDragSelectDemoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  return (
    <StyledContainer ref={containerRef}>
      <StyledGrid>
        {Array.from({ length: itemCount }, (_, index) => (
          <SelectableItem
            key={index}
            id={`item-${index}`}
            selected={selectedItems.has(`item-${index}`)}
          >
            Item {index + 1}
          </SelectableItem>
        ))}
      </StyledGrid>

      {!disableSelection && (
        <DragSelect
          selectableItemsContainerRef={containerRef}
          onDragSelectionChange={handleSelectionChange}
          onDragSelectionStart={() => {}}
          onDragSelectionEnd={() => {}}
        />
      )}
    </StyledContainer>
  );
};

const ScrollableDragSelectDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  return (
    <StyledScrollableWrapper componentInstanceId="scrollable-demo">
      <div ref={containerRef} style={{ position: 'relative', padding: '16px' }}>
        <StyledLargeGrid>
          {Array.from({ length: 36 }, (_, index) => (
            <SelectableItem
              key={index}
              id={`scroll-item-${index}`}
              selected={selectedItems.has(`scroll-item-${index}`)}
            >
              Item {index + 1}
            </SelectableItem>
          ))}
        </StyledLargeGrid>

        <DragSelect
          selectableItemsContainerRef={containerRef}
          onDragSelectionChange={handleSelectionChange}
          scrollWrapperComponentInstanceId="scrollable-demo"
        />
      </div>
    </StyledScrollableWrapper>
  );
};

const meta: Meta<typeof DragSelect> = {
  title: 'UI/Utilities/DragSelect/DragSelect',
  component: DragSelect,
  decorators: [ComponentDecorator],
  parameters: {
    docs: {
      description: {
        component: `
The DragSelect component enables users to select multiple items by dragging a selection box.

**Key Features:**
- Mouse-based drag selection with visual feedback
- Intersection detection for item selection
- Auto-scroll support for large containers (when used with ScrollWrapper)
- Configurable selection boundaries
- Integration with selectable items via data attributes
- Universal compatibility - works with or without ScrollWrapper

**Usage:**
- Items must have \`data-selectable-id\` attribute
- Use \`data-select-disable="true"\` to disable selection on specific elements
- For auto-scroll functionality, wrap in ScrollWrapper and provide \`scrollWrapperComponentInstanceId\`
- Can work without ScrollWrapper for basic drag selection (auto-scroll gracefully disabled)
        `,
      },
    },
  },
  argTypes: {
    selectableItemsContainerRef: { control: false },
    onDragSelectionChange: { control: false },
    onDragSelectionStart: { control: false },
    onDragSelectionEnd: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DragSelect>;

export const Default: Story = {
  render: () => <BasicDragSelectDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Basic drag selection with a grid of selectable items. Works without ScrollWrapper - drag selection is universal and can work in any container.',
      },
    },
  },
};

export const WithAutoScroll: Story = {
  render: () => <ScrollableDragSelectDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Drag selection with auto-scroll support. The container will automatically scroll when dragging near the edges. Uses ScrollWrapper for auto-scroll functionality.',
      },
    },
  },
};

export const InteractiveDragSelection: Story = {
  render: () => <BasicDragSelectDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Item 1');

    const container = canvasElement
      .querySelector('[data-selectable-id="item-0"]')
      ?.closest('div');

    if (isDefined(container)) {
      await userEvent.pointer([
        { target: container, coords: { x: 50, y: 50 } },
        { keys: '[MouseLeft>]', coords: { x: 50, y: 50 } },
        { coords: { x: 200, y: 150 } },
        { keys: '[/MouseLeft]' },
      ]);
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Automated interaction test showing drag selection behavior. Watch as items get selected during the drag operation.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => <BasicDragSelectDemo disableSelection={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Component without drag selection enabled. Items are displayed but cannot be selected via dragging.',
      },
    },
  },
};
