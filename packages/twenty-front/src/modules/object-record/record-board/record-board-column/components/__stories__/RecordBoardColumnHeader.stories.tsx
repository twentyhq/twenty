import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnHeader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeader';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import {
  RecordGroupDefinitionType,
  type RecordGroupDefinition,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { DragDropProvider } from '@dnd-kit/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const company = getTestEnrichedObjectMetadataItemsMock().find(
  (object) => object.nameSingular === 'company',
)!;
const field = company.fields.find(
  (item) => item.name === 'idealCustomerProfile',
)!;
const companyView = mockedViews.find((view) => view.name === 'All Companies')!;
const RECORD_INDEX_ID = `companies-${companyView.id}`;
const BOARD_ID = 'board-column-header-story';
const handleDragStart = fn();
const group: RecordGroupDefinition = {
  id: 'board-header-first-group',
  title: 'First group',
  value: 'true',
  color: 'blue',
  type: RecordGroupDefinitionType.Value,
  position: 0,
  isVisible: true,
};
const nextGroup: RecordGroupDefinition = {
  ...group,
  id: 'board-header-second-group',
  title: 'Second group',
  value: 'false',
  position: 1,
};

const BoardHeaderExample = () => (
  <RecordBoardComponentInstanceContext.Provider
    value={{ instanceId: BOARD_ID }}
  >
    <RecordBoardContext.Provider
      value={{
        objectMetadataItem: company,
        selectFieldMetadataItem: field,
        createOneRecord: () => {},
        updateOneRecord: () => {},
        deleteOneRecord: async () => {},
        recordBoardId: BOARD_ID,
        objectPermissions: getDefaultObjectPermissions(company.id),
      }}
    >
      <RecordBoardColumnContext.Provider
        value={{
          columnDefinition: group,
          columnId: group.id,
          recordIds: [],
          columnIndex: 0,
        }}
      >
        <DragDropProvider
          sensors={DND_KIT_SENSORS}
          onDragStart={handleDragStart}
        >
          <DragDropItemSortableCell id={group.id} index={0} group={BOARD_ID}>
            <RecordBoardColumnHeader />
          </DragDropItemSortableCell>
        </DragDropProvider>
      </RecordBoardColumnContext.Provider>
    </RecordBoardContext.Provider>
  </RecordBoardComponentInstanceContext.Provider>
);

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordBoard/RecordBoardColumnHeader',
  component: RecordBoardColumnHeader,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ToastDecorator,
    ObjectMetadataItemsDecorator,
  ],
  render: () => <BoardHeaderExample />,
  beforeEach: () => {
    handleDragStart.mockClear();
    jotaiStore.set(
      isRecordBoardViewSettingsReadOnlyComponentState.atomFamily({
        instanceId: BOARD_ID,
      }),
      false,
    );
  },
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj;

export const ChipDotsActionsAndDrag: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const chip = await canvas.findByRole('button', {
      name: 'First group',
    });
    jotaiStore.set(
      recordGroupDefinitionFamilyState.atomFamily(group.id),
      group,
    );
    jotaiStore.set(
      recordGroupDefinitionFamilyState.atomFamily(nextGroup.id),
      nextGroup,
    );
    jotaiStore.set(
      recordGroupIdsComponentState.atomFamily({ instanceId: RECORD_INDEX_ID }),
      [group.id, nextGroup.id],
    );
    jotaiStore.set(
      recordIndexGroupFieldMetadataItemComponentState.atomFamily({
        instanceId: RECORD_INDEX_ID,
      }),
      field,
    );

    await userEvent.click(chip);
    const menu = await body.findByRole('menu');
    const chipPosition = chip.getBoundingClientRect();
    await waitFor(() =>
      expect(
        Math.abs(menu.getBoundingClientRect().left - chipPosition.left),
      ).toBeLessThan(2),
    );
    expect(canvas.getByRole('button', { name: 'More options' })).toBeVisible();
    await userEvent.click(
      within(menu).getByRole('menuitem', { name: 'Move right' }),
    );
    expect(menu).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(menu).not.toBeInTheDocument());

    await userEvent.hover(chip);
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    const dotsMenu = await body.findByRole('menu');
    await waitFor(() =>
      expect(
        Math.abs(dotsMenu.getBoundingClientRect().left - chipPosition.left),
      ).toBeLessThan(2),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'More options' }));
    const reopenedMenu = await body.findByRole('menu');
    await userEvent.click(
      within(reopenedMenu).getByRole('menuitem', { name: 'Hide' }),
    );
    await waitFor(() => expect(reopenedMenu).not.toBeInTheDocument());
    expect(
      jotaiStore.get(recordGroupDefinitionFamilyState.atomFamily(group.id))
        ?.isVisible,
    ).toBe(false);

    await userEvent.pointer([
      {
        target: chip,
        keys: '[MouseLeft>]',
        coords: {
          clientX: chipPosition.left + 5,
          clientY: chipPosition.top + 5,
        },
      },
      {
        target: chip,
        coords: {
          clientX: chipPosition.left + 50,
          clientY: chipPosition.top + 5,
        },
      },
    ]);
    await waitFor(() => expect(handleDragStart).toHaveBeenCalled());
    await userEvent.keyboard('{Escape}');
    await userEvent.pointer('[/MouseLeft]');
  },
};

export const ReadOnly: Story = {
  beforeEach: () => {
    jotaiStore.set(
      isRecordBoardViewSettingsReadOnlyComponentState.atomFamily({
        instanceId: BOARD_ID,
      }),
      true,
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('First group');
    expect(
      canvas.queryByRole('button', { name: 'First group' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
  },
};
