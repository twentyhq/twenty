import { FileFolder } from 'twenty-shared/types';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

jest.mock('src/engine/core-modules/file-storage/file-storage.service', () => ({
  FileStorageService: class {},
}));
jest.mock('src/engine/core-modules/application/application.service', () => ({
  ApplicationService: class {},
}));

const WORKSPACE_ID = 'workspace-1';

const buildLargeOutput = (): ToolOutput => ({
  success: true,
  message: 'ok',
  result: {
    items: Array.from({ length: 2000 }, (_, index) => ({
      id: `record-${index}`,
      label: 'a-fairly-long-label-value-to-inflate-the-payload-size',
    })),
  },
});

describe('ToolOutputSpillService', () => {
  const writeFile = jest.fn();
  const findApplication = jest.fn();

  const service = new ToolOutputSpillService(
    { writeFile } as unknown as FileStorageService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: findApplication,
    } as unknown as ApplicationService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    findApplication.mockResolvedValue({
      workspaceCustomFlatApplication: { universalIdentifier: 'app-uid' },
    });
    writeFile.mockResolvedValue({ id: 'file-123' });
  });

  it('returns the output unchanged when under the byte budget', async () => {
    const output: ToolOutput = {
      success: true,
      message: 'ok',
      result: { id: 'small' },
    };

    const result = await service.spillIfTooLarge(
      output,
      { workspaceId: WORKSPACE_ID },
      { toolName: 'find_many_companies' },
    );

    expect(result).toBe(output);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('spills oversized output to an AgentChat file and returns an envelope', async () => {
    const result = await service.spillIfTooLarge(
      buildLargeOutput(),
      { workspaceId: WORKSPACE_ID },
      { toolName: 'find_many_companies' },
    );

    expect(writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        fileFolder: FileFolder.AgentChat,
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: 'app-uid',
        settings: { isTemporaryFile: false, toDelete: false },
      }),
    );

    const envelope = result.result as Record<string, unknown>;
    const outputRef = envelope.outputRef as Record<string, unknown>;

    expect(envelope.spilled).toBe(true);
    expect(outputRef.fileId).toBe('file-123');
    expect(outputRef.mimeType).toBe('application/json');
    expect(outputRef.sizeBytes).toBeGreaterThan(16384);
    expect(envelope.shape).toBeDefined();
    expect(envelope.hint).toContain('extract_json_paths');
  });

  it.each(['extract_json_paths', 'search_output'])(
    'never spills the output of the %s navigation tool',
    async (toolName) => {
      const output = buildLargeOutput();

      const result = await service.spillIfTooLarge(
        output,
        { workspaceId: WORKSPACE_ID },
        { toolName },
      );

      expect(result).toBe(output);
      expect(writeFile).not.toHaveBeenCalled();
    },
  );

  it('uses the per-tool largeOutputHint when provided', async () => {
    const result = await service.spillIfTooLarge(
      buildLargeOutput(),
      { workspaceId: WORKSPACE_ID },
      {
        toolName: 'get_workflow_run',
        largeOutputHint: 'Errors live under failedStepLogs[*].error.',
      },
    );

    const envelope = result.result as Record<string, unknown>;

    expect(envelope.hint).toBe('Errors live under failedStepLogs[*].error.');
  });

  it('falls back to the inline output with a warning when the spill write fails', async () => {
    writeFile.mockRejectedValue(new Error('storage down'));

    const output = buildLargeOutput();

    const result = await service.spillIfTooLarge(
      output,
      { workspaceId: WORKSPACE_ID },
      { toolName: 'find_many_companies' },
    );

    expect((result.result as Record<string, unknown>).items).toBeDefined();
    expect(result.warnings).toEqual([
      'Large output spill failed; the full output is returned inline.',
    ]);
  });
});
