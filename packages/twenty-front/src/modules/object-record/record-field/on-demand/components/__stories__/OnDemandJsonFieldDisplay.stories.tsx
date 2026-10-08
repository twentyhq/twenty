import { OnDemandFieldStory } from '@/object-record/record-field/on-demand/testing/OnDemandFieldStory';
import {
  ON_DEMAND_FIELD_STORY_RESPONSE,
  ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT,
} from '@/object-record/record-field/on-demand/testing/onDemandFieldStoryResponse';
import {
  ON_DEMAND_FIELD_STORY_RECORD_ID,
  ON_DEMAND_FIELD_STORY_UPDATED_AT,
  seedOnDemandFieldStory,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const requestValue = fn();
const meta: Meta<typeof OnDemandFieldStory> = {
  title: 'Modules/ObjectRecord/RecordField/OnDemandJsonFieldDisplay',
  component: OnDemandFieldStory,
  decorators: [ToastDecorator],
  args: { onRecordClick: fn() },
  beforeEach: () => {
    requestValue.mockClear();
    seedOnDemandFieldStory();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', ({ variables }) => {
          requestValue(variables.objectRecordId);
          return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof OnDemandFieldStory>;

export const Catalog: CatalogStory<Story, typeof OnDemandFieldStory> = {
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

export const LoadsOnlyOnClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'View value' });

    expect(requestValue).not.toHaveBeenCalled();
    await userEvent.click(trigger);

    expect(
      await body.findByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
    ).toBeVisible();
    expect(requestValue).toHaveBeenCalledTimes(1);
    expect(requestValue).toHaveBeenCalledWith(ON_DEMAND_FIELD_STORY_RECORD_ID);
    expect(args.onRecordClick).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      canvas.queryByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
    ).not.toBeInTheDocument();
  },
};

export const HydratedClosedValueStaysCompact: Story = {
  beforeEach: () =>
    seedOnDemandFieldStory({
      value: { text: ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT.repeat(5000) },
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      await canvas.findByRole('button', { name: 'View value' }),
    ).toBeVisible();
    expect(canvas.queryByText(/The customer asked/)).not.toBeInTheDocument();
    expect(requestValue).not.toHaveBeenCalled();
  },
};

export const LoadedNullIsEmpty: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', () =>
          HttpResponse.json({
            data: {
              callRecording: {
                id: ON_DEMAND_FIELD_STORY_RECORD_ID,
                updatedAt: ON_DEMAND_FIELD_STORY_UPDATED_AT,
                transcript: null,
              },
            },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'View value' }),
    );
    expect(await body.findByText('Empty')).toBeVisible();
    expect(body.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const ErrorCanRetry: Story = {
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
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'View value' }),
    );
    expect(await body.findByRole('alert')).toHaveTextContent(
      'Could not load this value.',
    );
    await userEvent.click(body.getByRole('button', { name: 'Retry' }));
    expect(
      await body.findByText(ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT),
    ).toBeVisible();
    expect(requestValue).toHaveBeenCalledTimes(2);
    await userEvent.click(canvasElement);
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const MissingRecordIsNotEmpty: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', () =>
          HttpResponse.json({ data: { callRecording: null } }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'View value' }),
    );
    expect(await body.findByRole('alert')).toHaveTextContent(
      'Record not found.',
    );
    expect(body.queryByText('Empty')).not.toBeInTheDocument();
  },
};

export const ForbiddenValueCannotLoad: Story = {
  args: { isForbidden: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'View value' }),
    );
    expect(await body.findByRole('alert')).toHaveTextContent(
      'You do not have access to this value.',
    );
    expect(requestValue).not.toHaveBeenCalled();
  },
};

export const DismissedRequestDoesNotReopen: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneCallRecording', async () => {
          await delay(300);
          return HttpResponse.json(ON_DEMAND_FIELD_STORY_RESPONSE);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'View value' }),
    );
    expect(
      await body.findByRole('status', { name: 'Loading value…' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        jotaiStore.get(
          recordStoreFamilyState.atomFamily(ON_DEMAND_FIELD_STORY_RECORD_ID),
        )?.transcript,
      ).toEqual({ text: ON_DEMAND_FIELD_STORY_TRANSCRIPT_TEXT }),
    );
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
