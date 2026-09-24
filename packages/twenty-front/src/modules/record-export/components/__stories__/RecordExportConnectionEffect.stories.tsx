import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { RecordExportConnectionEffect } from '@/record-export/components/RecordExportConnectionEffect';
import { createRecordExportConnection } from '@/record-export/utils/createRecordExportConnection';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { IconFileExport } from 'twenty-ui/icon';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const ExportExample = () => {
  const [connection] = useState(createRecordExportConnection);
  const [isConnected, setIsConnected] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>();
  const download = async () => {
    setIsExporting(true);
    setError(undefined);
    try {
      await connection.exportRecords({
        input: { objectMetadataId: 'person', fieldMetadataIds: ['name'] },
        onProgress: setProgress,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <>
      {isConnected && (
        <RecordExportConnectionEffect cancel={connection.cancel} />
      )}
      <CommandMenuButton
        command={{
          key: 'export',
          label: 'Export',
          shortLabel: 'Export',
          Icon: IconFileExport,
        }}
        onClick={download}
        disabled={isExporting}
        loading={isExporting}
        progress={progress}
      />
      <button onClick={() => setIsConnected(false)}>Unmount connection</button>
      {error && <p role="alert">{error}</p>}
    </>
  );
};

const exportHandler = (finish: 'completed' | 'interrupted' | 'wait') =>
  http.post(`${REACT_APP_SERVER_BASE_URL}/metadata`, () => {
    const encoder = new TextEncoder();
    const event = (progress: number) =>
      encoder.encode(
        `event: next\ndata: ${JSON.stringify({
          data: {
            exportRecords: {
              id: 'export',
              filename: 'person.csv',
              progress,
              downloadUrl:
                progress === 100
                  ? '/file/record-export/export?token=token'
                  : null,
            },
          },
        })}\n\n`,
      );
    const body = new ReadableStream({
      async start(controller) {
        controller.enqueue(event(42));
        if (finish === 'wait') {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (finish === 'completed') {
          controller.enqueue(event(100));
        }
        controller.enqueue(encoder.encode('event: complete\ndata: null\n\n'));
        controller.close();
      },
    });
    return new HttpResponse(body, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  });

const meta: Meta<typeof ExportExample> = {
  title: 'Modules/RecordExport/Connection',
  component: ExportExample,
};
export default meta;
type Story = StoryObj<typeof ExportExample>;

export const AutomaticDownload: Story = {
  parameters: { msw: { handlers: [exportHandler('completed')] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const download = spyOn(
      HTMLAnchorElement.prototype,
      'click',
    ).mockImplementation(() => {});
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Export' }));
      await canvas.findByText('42%');
      expect(canvas.getByRole('button', { name: 'Export' })).toBeDisabled();
      expect(download).not.toHaveBeenCalled();
      await waitFor(() => expect(download).toHaveBeenCalledTimes(1), {
        timeout: 5000,
      });
      expect(download.mock.instances[0]).toHaveAttribute(
        'href',
        `${REACT_APP_SERVER_BASE_URL}/file/record-export/export?token=token`,
      );
      await waitFor(() =>
        expect(canvas.getByRole('button', { name: 'Export' })).toBeEnabled(),
      );
    } finally {
      download.mockRestore();
    }
  },
};

export const Interrupted: Story = {
  parameters: { msw: { handlers: [exportHandler('interrupted')] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Export' }));
    expect(
      await canvas.findByRole('alert', {}, { timeout: 5000 }),
    ).toHaveTextContent('export was interrupted');
    expect(canvas.getByRole('button', { name: 'Export' })).toBeEnabled();
  },
};

export const Unmount: Story = {
  parameters: { msw: { handlers: [exportHandler('wait')] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Export' }));
    await canvas.findByText('42%');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Unmount connection' }),
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Export' })).toBeEnabled(),
    );
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const PageHide: Story = {
  parameters: { msw: { handlers: [exportHandler('wait')] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Export' }));
    await canvas.findByText('42%');
    window.dispatchEvent(new Event('pagehide'));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Export' })).toBeEnabled(),
    );
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
