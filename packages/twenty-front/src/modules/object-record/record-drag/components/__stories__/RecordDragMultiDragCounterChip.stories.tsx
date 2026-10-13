import { RecordDragMultiDragCounterChip } from '@/object-record/record-drag/components/RecordDragMultiDragCounterChip';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

const RECORD_SELECTION_INSTANCE_ID = 'record-drag-count-story';

const StyledDragOverlay = styled.div`
  height: ${themeCssVariables.spacing[6]};
  position: relative;
  width: ${themeCssVariables.spacing[6]};
`;

const meta: Meta<typeof RecordDragMultiDragCounterChip> = {
  title: 'Modules/ObjectRecord/RecordDrag/RecordDragMultiDragCounterChip',
  component: RecordDragMultiDragCounterChip,
  decorators: [
    (Story) => (
      <RecordSelectionComponentInstanceContext.Provider
        value={{ instanceId: RECORD_SELECTION_INSTANCE_ID }}
      >
        <StyledDragOverlay role="group" aria-label="Dragged records">
          <Story />
        </StyledDragOverlay>
      </RecordSelectionComponentInstanceContext.Provider>
    ),
    ComponentDecorator,
  ],
  beforeEach: () => {
    jotaiStore.set(
      draggedRecordIdsComponentState.atomFamily({
        instanceId: RECORD_SELECTION_INSTANCE_ID,
      }),
      [],
    );
  },
};

export default meta;
type Story = StoryObj<typeof RecordDragMultiDragCounterChip>;

export const SelectionCountPolicy: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByRole('group', { name: 'Dragged records' });
    const draggedRecordIds = draggedRecordIdsComponentState.atomFamily({
      instanceId: RECORD_SELECTION_INSTANCE_ID,
    });

    expect(overlay).toBeEmptyDOMElement();

    jotaiStore.set(draggedRecordIds, ['record-1', 'record-2']);
    await expect(await canvas.findByText('2')).toBeVisible();

    jotaiStore.set(draggedRecordIds, ['record-1']);
    await waitFor(() => expect(overlay).toBeEmptyDOMElement());

    jotaiStore.set(
      draggedRecordIds,
      Array.from({ length: 1000 }, (_, index) => `record-${index}`),
    );
    await expect(await canvas.findByText('1000')).toBeVisible();
  },
};
