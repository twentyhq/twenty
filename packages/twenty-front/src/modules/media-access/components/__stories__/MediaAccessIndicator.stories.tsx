import { MediaAccessIndicator } from '@/media-access/components/MediaAccessIndicator';
import { mediaAccessSessionsState } from '@/media-access/states/mediaAccessSessionsState';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type MediaAccessSession } from '@/media-access/types/MediaAccessSession';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof MediaAccessIndicator> = {
  title: 'Modules/MediaAccess/MediaAccessIndicator',
  component: MediaAccessIndicator,
  decorators: [ComponentDecorator],
};

export default meta;

const MediaSessionIndicatorPreview = ({
  isPending,
}: {
  isPending: boolean;
}) => {
  const [store] = useState(() => {
    const previewStore = createStore();

    previewStore.set(mediaAccessSessionsState.atom, [
      {
        id: 'recorder',
        ownerId: 'recorder',
        ownerName: 'Call recorder',
        status: isPending ? 'pending' : 'capturing',
        mediaTypes: ['audio', 'video'],
        onStop: fn(),
      },
    ]);

    return previewStore;
  });

  return (
    <Provider store={store}>
      <MediaAccessIndicator />
    </Provider>
  );
};

export const CircularIndicators: StoryObj<typeof MediaAccessIndicator> = {
  render: () => (
    <>
      <MediaSessionIndicatorPreview isPending={false} />
      <MediaSessionIndicatorPreview isPending />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of [
      'Microphone or camera in use',
      'Media access requests',
    ]) {
      const trigger = canvas.getByRole('button', { name });
      const dot = trigger.querySelector('span[aria-hidden]:empty');

      if (!isDefined(dot)) {
        throw new Error(`Missing recording indicator for ${name}`);
      }

      const dotStyle = getComputedStyle(dot);

      await expect(dotStyle.width).toBe(dotStyle.height);
      await expect(dotStyle.borderRadius).toBe('50%');

      if (CSS.supports('corner-shape', 'round')) {
        await expect(['round', 'superellipse(1)']).toContain(
          dotStyle.getPropertyValue('corner-shape'),
        );
      }
    }
  },
};

const StoredSessionsIndicator = ({
  sessions,
}: {
  sessions: MediaAccessSession[];
}) => {
  const [store] = useState(() => {
    const previewStore = createStore();

    previewStore.set(mediaAccessSessionsState.atom, sessions);

    return previewStore;
  });

  return (
    <Provider store={store}>
      <MediaAccessIndicator />
    </Provider>
  );
};

const stopRecorderAudio = fn();
const stopRecorderVideo = fn();
const stopCameraApp = fn();

const recorderSession: MediaAccessSession = {
  id: 'recorder-audio',
  ownerId: 'recorder',
  ownerName: 'Recorder',
  status: 'capturing',
  mediaTypes: ['audio'],
  onStop: fn(),
};

export const Hidden: StoryObj<typeof MediaAccessIndicator> = {
  render: () => <StoredSessionsIndicator sessions={[]} />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button'),
    ).not.toBeInTheDocument();
  },
};

export const OneRowPerApplication: StoryObj<typeof MediaAccessIndicator> = {
  render: () => (
    <StoredSessionsIndicator
      sessions={[
        { ...recorderSession, onStop: stopRecorderAudio },
        {
          ...recorderSession,
          id: 'recorder-video',
          mediaTypes: ['video'],
          onStop: stopRecorderVideo,
        },
        {
          ...recorderSession,
          id: 'camera-session',
          ownerId: 'camera-app',
          ownerName: 'Camera app',
          mediaTypes: ['video'],
          onStop: stopCameraApp,
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText('Recorder')).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Microphone or camera in use' }),
    );

    const applications = await screen.findByRole('list', {
      name: 'Microphone or camera in use',
    });
    await waitFor(() => expect(applications).toBeVisible());
    const applicationsCanvas = within(applications);

    await expect(applicationsCanvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(applicationsCanvas.getAllByText('Recorder')).toHaveLength(1);
    await expect(
      applicationsCanvas.getByText('Microphone and camera'),
    ).toBeVisible();
    await expect(applicationsCanvas.getByText('Camera app')).toBeVisible();
    await expect(applicationsCanvas.getByText('Camera')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Stop capture for Recorder' }),
    );

    await expect(stopRecorderAudio).toHaveBeenCalledTimes(1);
    await expect(stopRecorderVideo).toHaveBeenCalledTimes(1);
    await expect(stopCameraApp).not.toHaveBeenCalled();
  },
};

export const PendingRequest: StoryObj<typeof MediaAccessIndicator> = {
  render: () => (
    <StoredSessionsIndicator
      sessions={[
        {
          ...recorderSession,
          status: 'pending',
          mediaTypes: ['audio'],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('button', { name: 'Microphone or camera in use' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Media access requests' }),
    );

    await waitFor(async () => {
      await expect(screen.getByText('Waiting for permission')).toBeVisible();
    });
    await expect(
      screen.getByRole('button', { name: 'Cancel media request for Recorder' }),
    ).toBeVisible();
  },
};

export const ClosesWithEscape: StoryObj<typeof MediaAccessIndicator> = {
  render: () => <StoredSessionsIndicator sessions={[recorderSession]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Microphone or camera in use' }),
    );
    await screen.findByRole('list', { name: 'Microphone or camera in use' });
    await userEvent.keyboard('{Escape}');

    await waitFor(async () => {
      await expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  },
};
