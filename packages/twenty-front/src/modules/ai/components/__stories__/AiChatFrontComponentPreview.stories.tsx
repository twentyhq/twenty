import { http, HttpResponse } from 'msw';
import { getWorker } from 'msw-storybook-addon';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
import {
  frontComponentPreviewHandlers,
  frontComponentPreviewReports,
  getFrontComponentPreviewMock,
  seedFrontComponentPreviewWorkspace,
} from '@/ai/components/__mocks__/aiChatFrontComponentPreviewMocks';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta: Meta<typeof AiChatFrontComponentPreview> = {
  title: 'Modules/AI/AiChatFrontComponentPreview',
  component: AiChatFrontComponentPreview,
  decorators: [RootDecorator, ComponentDecorator],
  beforeEach: () => seedFrontComponentPreviewWorkspace(),
  args: { draftId: 'current' },
  parameters: {
    container: { width: 500 },
    msw: { handlers: frontComponentPreviewHandlers },
  },
};

export default meta;
type Story = StoryObj<typeof AiChatFrontComponentPreview>;

export const InteractivePreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('region', {
        name: 'Component preview with sample data',
      }),
    ).toBeVisible();
    await expect(canvas.getByText('Sample data')).toBeVisible();
    await expect(canvas.getByText('Dashboard widget')).toBeVisible();
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Count: 0' },
        { timeout: 30000 },
      ),
    );
    await expect(
      await canvas.findByRole('button', { name: 'Count: 1' }),
    ).toBeVisible();
    await waitFor(() =>
      expect(canvas.queryByRole('status')).not.toBeInTheDocument(),
    );
  },
};

export const RecordPage: Story = {
  args: { draftId: 'record-page' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Record page widget'),
    ).toBeVisible();
  },
};

export const Saved: Story = {
  args: { draftId: 'saved' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Saved to Workspace app'),
    ).toBeVisible();
  },
};

export const Superseded: Story = {
  args: { draftId: 'superseded' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'A newer revision exists. Open the latest preview to save.',
      ),
    ).toBeVisible();
  },
};

export const Unavailable: Story = {
  args: { draftId: 'unavailable' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Could not load preview.');
  },
};

export const RuntimeError: Story = {
  args: { draftId: 'runtime-error' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert', {}, { timeout: 30000 }),
    ).toHaveTextContent('Component crashed.');
  },
};

export const Disabled: Story = {
  beforeEach: () => seedFrontComponentPreviewWorkspace(false),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText('Sample data'),
    ).not.toBeInTheDocument();
  },
};

export const RetryDraftLoad: Story = {
  beforeEach: () => {
    getWorker().use(
      http.get(
        `${REST_API_BASE_URL}/ai-front-components/drafts/:draftId`,
        () => new HttpResponse(null, { status: 503 }),
        { once: true },
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Could not load preview.',
    );
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
    await expect(
      await canvas.findByRole(
        'button',
        { name: 'Count: 0' },
        { timeout: 30000 },
      ),
    ).toBeVisible();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const RetryDependencyLoad: Story = {
  beforeEach: () => {
    getWorker().use(
      http.get(
        `${REST_API_BASE_URL}/front-component-shared-dependencies/storybook-app/storybook-checksum.js`,
        () => new HttpResponse(null, { status: 503 }),
        { once: true },
      ),
    );
  },
  play: RetryDraftLoad.play,
};

export const RefreshStatusPreservesInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Count: 0' },
        { timeout: 30000 },
      ),
    );
    await canvas.findByRole('button', { name: 'Count: 1' });
    getWorker().use(
      http.get(
        `${REST_API_BASE_URL}/front-component-shared-dependencies/storybook-app/storybook-checksum.js`,
        () => new HttpResponse(null, { status: 503 }),
      ),
    );
    for (const status of ['saved', 'superseded']) {
      getWorker().use(
        http.get(
          `${REST_API_BASE_URL}/ai-front-components/drafts/:draftId`,
          () =>
            HttpResponse.json({
              ...getFrontComponentPreviewMock(status),
              componentSource: 'invalid replacement source',
            }),
          { once: true },
        ),
      );
      dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
      await expect(
        await canvas.findByText(
          status === 'saved'
            ? 'Saved to Workspace app'
            : 'A newer revision exists. Open the latest preview to save.',
        ),
      ).toBeVisible();
      await expect(
        canvas.getByRole('button', { name: 'Count: 1' }),
      ).toBeVisible();
      await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    }
    await userEvent.click(canvas.getByRole('button', { name: 'Count: 1' }));
    await expect(
      await canvas.findByRole('button', { name: 'Count: 2' }),
    ).toBeVisible();
  },
};

let completeInitialRequest: (() => void) | undefined;

export const SupersededInitialLoad: Story = {
  beforeEach: () => {
    completeInitialRequest = undefined;
    getWorker().use(
      http.get(
        `${REST_API_BASE_URL}/ai-front-components/drafts/:draftId`,
        () =>
          new Promise<Response>((resolve) => {
            completeInitialRequest = () =>
              resolve(
                HttpResponse.json(getFrontComponentPreviewMock('superseded')),
              );
          }),
        { once: true },
      ),
    );
    return () => completeInitialRequest?.();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(completeInitialRequest).toBeDefined());
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Loading preview',
    );
    dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
    await canvas.findByRole('button', { name: 'Count: 0' }, { timeout: 30000 });
    completeInitialRequest?.();
    await userEvent.click(canvas.getByRole('button', { name: 'Count: 0' }));
    await expect(
      await canvas.findByRole('button', { name: 'Count: 1' }),
    ).toBeVisible();
    await expect(
      canvas.queryByText(
        'A newer revision exists. Open the latest preview to save.',
      ),
    ).not.toBeInTheDocument();
  },
};

export const BlankRuntimeError: Story = {
  args: { draftId: 'blank-runtime-error' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert', {}, { timeout: 30000 }),
    ).toHaveTextContent('Component failed to render.');
    await waitFor(() =>
      expect(frontComponentPreviewReports).toEqual([
        { message: 'Component failed to render.' },
      ]),
    );
  },
};

export const BoundedRuntimeError: Story = {
  args: { draftId: 'long-runtime-error' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert', {}, { timeout: 30000 }),
    ).toHaveTextContent('x'.repeat(2000));
    await waitFor(() =>
      expect(frontComponentPreviewReports).toEqual([
        { message: 'x'.repeat(2000) },
      ]),
    );
  },
};

export const ErrorReportingFailure: Story = {
  args: { draftId: 'report-failure' },
  play: async ({ canvasElement }) => {
    await waitFor(
      () =>
        expect(frontComponentPreviewReports).toEqual([
          { message: 'Component crashed.' },
        ]),
      { timeout: 30000 },
    );
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
      'Component crashed.',
    );
  },
};
