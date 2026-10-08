import { OnDemandCollectionFieldStory } from '@/object-record/record-field/on-demand/testing/OnDemandCollectionFieldStory';
import {
  ON_DEMAND_FIELD_STORY_RESPONSE,
  ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT,
} from '@/object-record/record-field/on-demand/testing/onDemandFieldStoryResponse';
import { seedOnDemandCollectionFieldStory } from '@/object-record/record-field/on-demand/testing/seedOnDemandCollectionFieldStory';
import { ON_DEMAND_FIELD_STORY_RECORD_ID } from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { PageFocusId } from '@/types/PageFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const requestValue = fn();

const meta: Meta<typeof OnDemandCollectionFieldStory> = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableCellOnDemandFieldDisplay',
  component: OnDemandCollectionFieldStory,
  decorators: [MemoryRouterDecorator, ToastDecorator],
  args: { surface: 'table' },
  beforeEach: () => {
    requestValue.mockClear();
    seedOnDemandCollectionFieldStory();
    jotaiStore.set(focusStackState.atom, [
      {
        focusId: PageFocusId.RecordIndex,
        componentInstance: {
          componentType: FocusComponentType.PAGE,
          componentInstanceId: PageFocusId.RecordIndex,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        },
      },
    ]);
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', () => {
          requestValue();
          return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof OnDemandCollectionFieldStory>;

export const Catalog: CatalogStory<Story, typeof OnDemandCollectionFieldStory> =
  {
    decorators: [CatalogDecorator],
    parameters: { catalog: { dimensions: [] } },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      expect(
        await canvas.findByRole('button', { name: 'View value' }),
      ).toBeVisible();
      expect(requestValue).not.toHaveBeenCalled();
    },
  };

export const TableReadonlyKeyboardActivation: Story = {
  args: { surface: 'table' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const row = await canvas.findByTestId(
      `row-id-${ON_DEMAND_FIELD_STORY_RECORD_ID}`,
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(row).toHaveAttribute('data-focused', 'true'));
    await userEvent.keyboard('{Enter}{ArrowRight}');
    await userEvent.keyboard('{Backspace}{Delete}a');
    expect(requestValue).not.toHaveBeenCalled();
    expect(body.queryByRole('textbox')).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    expect(
      await body.findByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
    ).toBeVisible();
    expect(body.getAllByRole('dialog')).toHaveLength(1);
    await userEvent.keyboard('{Escape}');
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(row).toHaveAttribute('data-focused', 'true'));
    await userEvent.keyboard('{Enter}{ArrowRight}');
    await userEvent.keyboard(' ');
    expect(
      await body.findByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
    ).toBeVisible();
    expect(requestValue).toHaveBeenCalledTimes(2);
  },
};

const assertViewerSurvivesHoverChanges = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const nameCellValue = await canvas.findByText('Customer call');
  const initialTriggers = await canvas.findAllByRole('button', {
    name: 'View value',
  });
  await userEvent.hover(initialTriggers[0]);
  const triggers = await canvas.findAllByRole('button', {
    name: 'View value',
  });
  await userEvent.click(triggers[triggers.length - 1]);

  const viewer = await body.findByRole('dialog', { name: 'Transcript' });
  expect(
    within(viewer).getByRole('status', { name: 'Loading value…' }),
  ).toBeVisible();
  await userEvent.hover(nameCellValue);
  expect(viewer).toBeVisible();
  expect(
    within(viewer).getByRole('status', { name: 'Loading value…' }),
  ).toBeVisible();
  expect(
    await within(viewer).findByText(
      ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT,
      {},
      { timeout: 3000 },
    ),
  ).toBeVisible();

  await userEvent.hover(initialTriggers[0]);
  await userEvent.hover(nameCellValue);
  await userEvent.hover(viewer);
  expect(viewer).toBeVisible();
  expect(requestValue).toHaveBeenCalledTimes(1);
  await userEvent.click(canvasElement);
  expect(body.queryByRole('dialog')).not.toBeInTheDocument();
};

export const TableViewerSurvivesHoverChanges: Story = {
  args: { surface: 'table' },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', async () => {
          requestValue();
          await delay(1000);
          return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
        }),
      ],
    },
  },
  play: assertViewerSurvivesHoverChanges,
};

export const FocusedTableViewerSurvivesHoverChanges: Story = {
  ...TableViewerSurvivesHoverChanges,
  play: async ({ canvasElement }) => {
    const row = await within(canvasElement).findByTestId(
      `row-id-${ON_DEMAND_FIELD_STORY_RECORD_ID}`,
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(row).toHaveAttribute('data-focused', 'true'));
    await userEvent.keyboard('{Enter}{ArrowRight}');
    await assertViewerSurvivesHoverChanges({ canvasElement });
  },
};
