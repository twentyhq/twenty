import { ManagedIframe } from '@/media-access/components/ManagedIframe';
import { MediaAccessIndicator } from '@/media-access/components/MediaAccessIndicator';
import { mediaAccessSessionsState } from '@/media-access/states/mediaAccessSessionsState';
import { type MediaAccessSession } from '@/media-access/types/MediaAccessSession';
import { getMediaAccessOwnerId } from '@/media-access/utils/getMediaAccessOwnerId';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { type CSSProperties, useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof ManagedIframe> = {
  title: 'Modules/MediaAccess/ManagedIframe',
  component: ManagedIframe,
  decorators: [ComponentDecorator],
};

export default meta;

const MICROPHONE_PERMISSION = {
  origin: 'https://example.com',
  microphone: true,
  camera: false,
};

const NATIVE_CAPTURE_SESSION: MediaAccessSession = {
  id: 'recorder-session',
  ownerId: getMediaAccessOwnerId({ type: 'application', id: 'recorder' }),
  ownerName: 'Native recorder',
  status: 'capturing',
  mediaTypes: ['video'],
  onStop: fn(),
};

const CLASS_SIZED_IFRAME_CLASS_NAME = 'managed-iframe-story-class-sized';

const ManagedIframePreview = ({
  hasNativeCapture = false,
  iframeStyle,
  iframeClassName,
  initialPermission = MICROPHONE_PERMISSION,
}: {
  hasNativeCapture?: boolean;
  iframeStyle?: CSSProperties;
  iframeClassName?: string;
  initialPermission?: IframeMediaPermission;
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const [isGranted, setIsGranted] = useState(true);
  const [permission, setPermission] = useState(initialPermission);
  const [store] = useState(() => {
    const previewStore = createStore();
    previewStore.set(
      mediaAccessSessionsState.atom,
      hasNativeCapture ? [NATIVE_CAPTURE_SESSION] : [],
    );

    return previewStore;
  });

  return (
    <Provider store={store}>
      <style>{`.${CLASS_SIZED_IFRAME_CLASS_NAME} { border: 0; height: 180px; width: 376px; }`}</style>
      <MediaAccessIndicator />
      <Button onClick={() => setIsHidden(!isHidden)}>
        {isHidden ? 'Show phone' : 'Hide phone'}
      </Button>
      <Button onClick={() => setIsGranted(!isGranted)}>
        {isGranted ? 'Revoke media access' : 'Grant media access'}
      </Button>
      <Button
        onClick={() =>
          setPermission((currentPermission) => ({
            ...currentPermission,
            camera: !currentPermission.camera,
          }))
        }
      >
        {permission.camera ? 'Revoke camera' : 'Grant camera'}
      </Button>
      <div style={{ width: 500, height: 250 }}>
        <ManagedIframe
          owner={{ type: 'workspace-widget', id: 'phone', name: 'Aircall' }}
          iframeMediaPermissions={isGranted ? [permission] : []}
          requestedMediaCapabilities={['microphone', 'camera']}
          src="https://example.com"
          title="Aircall phone"
          className={iframeClassName}
          width={isDefined(iframeClassName) ? undefined : '100%'}
          height={isDefined(iframeClassName) ? undefined : '100%'}
          hidden={isHidden}
          style={iframeStyle}
          sandbox="allow-scripts allow-forms"
          allow="microphone *; camera *; encrypted-media"
        />
      </div>
    </Provider>
  );
};

export const EnableAndDisable: StoryObj<typeof ManagedIframe> = {
  render: () => <ManagedIframePreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialFrame = canvas.getByTitle('Aircall phone');

    await expect(initialFrame).toHaveAttribute(
      'allow',
      "microphone 'none'; camera 'none'; encrypted-media",
    );
    await expect(
      canvas.queryByRole('button', { name: 'Media access enabled' }),
    ).not.toBeInTheDocument();
    await canvas.findByRole('button', { name: 'Enable microphone' });
    await userEvent.click(canvas.getByRole('button', { name: 'Hide phone' }));
    await expect(initialFrame).not.toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Enable microphone' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Show phone' }));
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );

    const enabledFrame = canvas.getByTitle('Aircall phone');
    await expect(enabledFrame).not.toBe(initialFrame);
    await expect(enabledFrame).toHaveAttribute(
      'allow',
      "microphone https://example.com; camera 'none'; encrypted-media",
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Hide phone' }));
    await expect(enabledFrame).not.toBeVisible();
    await expect(canvas.getByTitle('Aircall phone')).toBe(enabledFrame);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Media access enabled' }),
    );
    await expect(
      await screen.findByText('Microphone access enabled'),
    ).toBeVisible();
    await expect(screen.getByText('https://example.com')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Disable media access for Aircall' }),
    );

    await waitFor(() => expect(enabledFrame).not.toBeInTheDocument());
    await expect(
      canvas.queryByRole('button', { name: 'Media access enabled' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Show phone' }));
    await expect(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    ).toBeVisible();
    await expect(canvas.getByTitle('Aircall phone')).toHaveAttribute(
      'allow',
      "microphone 'none'; camera 'none'; encrypted-media",
    );
  },
};

export const RevokedPermission: StoryObj<typeof ManagedIframe> = {
  render: () => <ManagedIframePreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );
    const enabledFrame = canvas.getByTitle('Aircall phone');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Revoke media access' }),
    );

    await waitFor(() => expect(enabledFrame).not.toBeInTheDocument());
    await expect(
      canvas.queryByRole('button', { name: 'Media access enabled' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Enable microphone' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Grant media access' }),
    );
    await expect(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Media access enabled' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByTitle('Aircall phone')).toHaveAttribute(
      'allow',
      "microphone 'none'; camera 'none'; encrypted-media",
    );
  },
};

export const CameraPermission: StoryObj<typeof ManagedIframe> = {
  render: () => (
    <ManagedIframePreview
      initialPermission={{
        ...MICROPHONE_PERMISSION,
        microphone: false,
        camera: true,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialFrame = canvas.getByTitle('Aircall phone');

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable camera' }),
    );

    const enabledFrame = canvas.getByTitle('Aircall phone');

    await expect(enabledFrame).not.toBe(initialFrame);
    await expect(enabledFrame).toHaveAttribute(
      'allow',
      "microphone 'none'; camera https://example.com; encrypted-media",
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Media access enabled' }),
    );
    await expect(
      await screen.findByText('Camera access enabled'),
    ).toBeVisible();
  },
};

export const ExpandedPermission: StoryObj<typeof ManagedIframe> = {
  render: () => <ManagedIframePreview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );

    const microphoneFrame = canvas.getByTitle('Aircall phone');

    await userEvent.click(canvas.getByRole('button', { name: 'Grant camera' }));
    await expect(
      await canvas.findByRole('button', {
        name: 'Enable microphone and camera',
      }),
    ).toBeVisible();
    await expect(canvas.getByTitle('Aircall phone')).toBe(microphoneFrame);
    await expect(microphoneFrame).toHaveAttribute(
      'allow',
      "microphone https://example.com; camera 'none'; encrypted-media",
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Enable microphone and camera' }),
    );

    const combinedFrame = canvas.getByTitle('Aircall phone');

    await expect(combinedFrame).not.toBe(microphoneFrame);
    await expect(combinedFrame).toHaveAttribute(
      'allow',
      'microphone https://example.com; camera https://example.com; encrypted-media',
    );
    await expect(
      canvas.queryByRole('button', { name: 'Enable microphone and camera' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Media access enabled' }),
    );
    await expect(
      await screen.findByText('Microphone and camera access enabled'),
    ).toBeVisible();
  },
};

export const NativeCaptureAndExternalAccess: StoryObj<typeof ManagedIframe> = {
  render: () => <ManagedIframePreview hasNativeCapture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Microphone or camera in use' }),
    );

    const sessions = await screen.findByRole('list', {
      name: 'Microphone or camera in use',
    });
    await expect(within(sessions).getAllByRole('listitem')).toHaveLength(2);
    await expect(within(sessions).getByText('Camera')).toBeVisible();
    await expect(
      within(sessions).getByText('Microphone access enabled'),
    ).toBeVisible();
    await userEvent.click(
      within(sessions).getByRole('button', {
        name: 'Disable media access for Aircall',
      }),
    );

    await waitFor(() =>
      expect(within(sessions).getAllByRole('listitem')).toHaveLength(1),
    );
    await expect(
      within(sessions).getByRole('button', {
        name: 'Stop capture for Native recorder',
      }),
    ).toBeVisible();
  },
};

export const FixedSize: StoryObj<typeof ManagedIframe> = {
  render: () => (
    <ManagedIframePreview
      iframeStyle={{ width: 360, height: 180, border: 0 }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialFrame = canvas.getByTitle('Aircall phone');

    await expect(initialFrame.getBoundingClientRect().width).toBe(360);
    await expect(initialFrame.getBoundingClientRect().height).toBe(180);
    await expect(
      initialFrame.parentElement?.getBoundingClientRect().width,
    ).toBe(500);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );

    const enabledFrame = canvas.getByTitle('Aircall phone');
    await expect(enabledFrame).not.toBe(initialFrame);
    await expect(enabledFrame.getBoundingClientRect().width).toBe(360);
    await expect(enabledFrame.getBoundingClientRect().height).toBe(180);
  },
};

export const ClassSized: StoryObj<typeof ManagedIframe> = {
  render: () => (
    <ManagedIframePreview iframeClassName={CLASS_SIZED_IFRAME_CLASS_NAME} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initialFrame = canvas.getByTitle('Aircall phone');

    await expect(initialFrame.getBoundingClientRect().width).toBe(376);
    await expect(initialFrame.getBoundingClientRect().height).toBe(180);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Enable microphone' }),
    );

    const enabledFrame = canvas.getByTitle('Aircall phone');
    await expect(enabledFrame).not.toBe(initialFrame);
    await expect(enabledFrame.getBoundingClientRect().width).toBe(376);
    await expect(enabledFrame.getBoundingClientRect().height).toBe(180);
  },
};
