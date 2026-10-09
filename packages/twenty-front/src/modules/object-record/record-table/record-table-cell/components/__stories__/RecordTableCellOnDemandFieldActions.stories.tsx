import { OnDemandCollectionFieldStory } from '@/object-record/record-field/on-demand/testing/OnDemandCollectionFieldStory';
import {
  ON_DEMAND_FIELD_STORY_RESPONSE,
  ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT,
} from '@/object-record/record-field/on-demand/testing/onDemandFieldStoryResponse';
import { seedOnDemandCollectionFieldStory } from '@/object-record/record-field/on-demand/testing/seedOnDemandCollectionFieldStory';
import { ON_DEMAND_FIELD_STORY_RECORD_ID } from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { PageFocusId } from '@/types/PageFocusId';
import { emitSidePanelOpenEvent } from '@/ui/layout/side-panel/utils/emitSidePanelOpenEvent';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { generateMockRecordNode } from '~/testing/utils/generateMockRecordNode';

const requestValue = fn();
const persistValue = fn();
const persistValueHandler = graphql.mutation(
  'UpdateOneCallRecording',
  ({ variables }) => {
    persistValue(variables.input);
    return HttpResponse.json({
      data: {
        updateCallRecording: {
          ...generateMockRecordNode({
            objectNameSingular: 'workflowRun',
            input: {
              ...ON_DEMAND_FIELD_STORY_RESPONSE.data.callRecording,
              ...variables.input,
            },
            withDepthOneRelation: true,
            computeReferences: false,
          }),
          __typename: 'CallRecording',
          transcript: variables.input.transcript,
        },
      },
    });
  },
);

const meta: Meta<typeof OnDemandCollectionFieldStory> = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableCellOnDemandFieldActions',
  component: OnDemandCollectionFieldStory,
  decorators: [MemoryRouterDecorator, ToastDecorator],
  args: { surface: 'table', isEditable: true },
  beforeEach: () => {
    requestValue.mockClear();
    persistValue.mockClear();
    seedOnDemandCollectionFieldStory({ isEditable: true });
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
        graphql.query('FindOneCallRecording', async () => {
          requestValue();
          await delay(300);
          return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
        }),
        persistValueHandler,
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof OnDemandCollectionFieldStory>;

const focusJsonCell = async (canvasElement: HTMLElement) => {
  const row = await within(canvasElement).findByTestId(
    `row-id-${ON_DEMAND_FIELD_STORY_RECORD_ID}`,
  );
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(row).toHaveAttribute('data-focused', 'true'));
  await userEvent.keyboard('{Enter}{ArrowRight}');
};

export const KeyboardOpensExistingJsonEditor: Story = {
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    expect(
      await body.findByRole('button', { name: 'Edit JSON' }),
    ).toBeVisible();
    expect(body.getByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT)).toBeVisible();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await waitFor(() =>
      expect(
        body.queryByRole('button', { name: 'Edit JSON' }),
      ).not.toBeInTheDocument(),
    );
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const SidePanelOpeningClosesJsonEditor: Story = {
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    expect(
      await body.findByRole('button', { name: 'Edit JSON' }),
    ).toBeVisible();
    emitSidePanelOpenEvent();
    await waitFor(() =>
      expect(
        body.queryByRole('button', { name: 'Edit JSON' }),
      ).not.toBeInTheDocument(),
    );
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const DeleteLoadsBeforeClearing: Story = {
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Delete}');
    const body = within(canvasElement.ownerDocument.body);
    expect(
      await body.findByRole('status', { name: 'Loading value…' }),
    ).toBeVisible();
    expect(persistValue).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(persistValue).toHaveBeenCalledWith({ transcript: null }),
    );
    expect(
      jotaiStore.get(
        recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
      )?.transcript,
    ).toBeNull();
    expect(
      body.queryByRole('button', { name: 'Edit JSON' }),
    ).not.toBeInTheDocument();
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const BackspaceLoadsBeforeClearing: Story = {
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Backspace}');
    await waitFor(() =>
      expect(persistValue).toHaveBeenCalledWith({ transcript: null }),
    );
    expect(
      jotaiStore.get(
        recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
      )?.transcript,
    ).toBeNull();
  },
};

export const NavigationCancelsPendingClear: Story = {
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Delete}');
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('status', { name: 'Loading value…' });
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(
        jotaiStore.get(
          recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
        )?.transcript,
      ).toEqual({ text: ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT }),
    );
    expect(persistValue).not.toHaveBeenCalled();
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const DismissalCancelsPendingClear: Story = {
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Delete}');
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('status', { name: 'Loading value…' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        jotaiStore.get(
          recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
        )?.transcript,
      ).toEqual({ text: ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT }),
    );
    expect(persistValue).not.toHaveBeenCalled();
  },
};

export const FailedLoadCannotClear: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', () =>
          HttpResponse.json({ errors: [{ message: 'Unavailable' }] }),
        ),
        persistValueHandler,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Delete}');
    const body = within(canvasElement.ownerDocument.body);
    expect(await body.findByRole('alert')).toHaveTextContent(
      'Could not load this value.',
    );
    expect(persistValue).not.toHaveBeenCalled();
    expect(
      jotaiStore.get(
        recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
      )?.transcript,
    ).toBeUndefined();
  },
};

export const RetryAfterFailedClearOnlyLoads: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', () => {
          requestValue();
          if (requestValue.mock.calls.length === 1) {
            return HttpResponse.json({ errors: [{ message: 'Unavailable' }] });
          }
          return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
        }),
        persistValueHandler,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await focusJsonCell(canvasElement);
    await userEvent.keyboard('{Delete}');
    const body = within(canvasElement.ownerDocument.body);
    expect(await body.findByRole('alert')).toHaveTextContent(
      'Could not load this value.',
    );
    await userEvent.click(body.getByRole('button', { name: 'Retry' }));
    expect(
      await body.findByRole('button', { name: 'Edit JSON' }),
    ).toBeVisible();
    expect(requestValue).toHaveBeenCalledTimes(2);
    expect(persistValue).not.toHaveBeenCalled();
    expect(
      jotaiStore.get(
        recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
      )?.transcript,
    ).toEqual({ text: ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT });
  },
};

export const PasteUsesExistingJsonEditor: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', () =>
          HttpResponse.json({
            data: {
              callRecording: {
                ...ON_DEMAND_FIELD_STORY_RESPONSE.data.callRecording,
                transcript: null,
              },
            },
          }),
        ),
        persistValueHandler,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'View value' }),
    );
    const editButton = await body.findByRole('button', { name: 'Edit JSON' });
    expect(persistValue).not.toHaveBeenCalled();
    await userEvent.click(editButton);
    const editor = await body.findByRole('textbox', {}, { timeout: 10000 });
    await userEvent.click(editor);
    await userEvent.paste('{"text":"Updated JSON from paste"}');
    await waitFor(() =>
      expect(
        JSON.parse(
          body.getByTestId<HTMLInputElement>('code-editor-value').value,
        ),
      ).toEqual({ text: 'Updated JSON from paste' }),
    );
    // Monaco schedules cursor highlighting 50ms after editing its model.
    await userEvent.click(canvasElement, { delay: 100 });
    await waitFor(() =>
      expect(persistValue).toHaveBeenCalledWith({
        transcript: { text: 'Updated JSON from paste' },
      }),
    );
  },
};
