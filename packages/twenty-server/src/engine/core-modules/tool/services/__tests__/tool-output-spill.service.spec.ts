import { FileFolder } from 'twenty-shared/types';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { ToolOutputSpillService } from 'src/engine/core-modules/tool/services/tool-output-spill.service';
import { MAX_INLINE_TOOL_OUTPUT_BYTES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/max-inline-tool-output-bytes.constant';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

jest.mock(
  'src/engine/core-modules/file-storage/services/file-storage.service',
  () => ({
    FileStorageService: class {},
  }),
);
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
    // Echo a persisted id that differs from the generated fileId so the test
    // catches the envelope exposing the wrong id (the nav tools retrieve by
    // savedFile.id, not by the generated uuid).
    writeFile.mockImplementation(({ fileId }: { fileId: string }) =>
      Promise.resolve({ id: `persisted-${fileId}` }),
    );
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

    const writeFileArgs = writeFile.mock.calls[0][0] as {
      fileId: string;
      resourcePath: string;
    };

    const envelope = result.result as Record<string, unknown>;
    const outputRef = envelope.outputRef as Record<string, unknown>;

    expect(envelope.spilled).toBe(true);
    // The envelope must expose the persisted id (what the nav tools retrieve
    // by), not the generated fileId used to build the storage resourcePath.
    expect(outputRef.fileId).toBe(`persisted-${writeFileArgs.fileId}`);
    expect(writeFileArgs.resourcePath).toBe(
      `tool-output-spill/${writeFileArgs.fileId}.json`,
    );
    expect(outputRef.filename).toMatch(
      /^tool-output-find_many_companies-.+\.json$/,
    );
    expect(envelope.preview).toBeDefined();
    expect(envelope.hint).toContain('extract_json_paths');
  });

  it.each(['extract_json_paths', 'search_output'])(
    'returns %s navigation output under the byte budget unchanged',
    async (toolName) => {
      const output: ToolOutput = {
        success: true,
        message: 'ok',
        result: { matches: ['small'] },
      };

      const result = await service.spillIfTooLarge(
        output,
        { workspaceId: WORKSPACE_ID },
        { toolName },
      );

      expect(result).toBe(output);
      expect(writeFile).not.toHaveBeenCalled();
    },
  );

  it.each(['extract_json_paths', 'search_output'])(
    'caps oversized %s navigation output inline instead of spilling it',
    async (toolName) => {
      const output = buildLargeOutput();
      const serialized = JSON.stringify(output);

      const result = await service.spillIfTooLarge(
        output,
        { workspaceId: WORKSPACE_ID },
        { toolName },
      );

      expect(writeFile).not.toHaveBeenCalled();

      const capped = result.result as Record<string, unknown>;
      const content = capped.content as string;

      expect(capped.truncated).toBe(true);
      expect(capped.originalSizeBytes).toBe(Buffer.byteLength(serialized));
      expect(Buffer.byteLength(content)).toBeLessThanOrEqual(
        MAX_INLINE_TOOL_OUTPUT_BYTES,
      );
      expect(content.startsWith(serialized.slice(0, 100))).toBe(true);
      expect(content.endsWith(serialized.slice(-100))).toBe(true);
      expect(content).toContain('TRUNCATED');
      expect(content).toContain('offset');
      expect(result.message).toBe(output.message);
    },
  );

  it('truncates the output inline with a warning when the spill write fails', async () => {
    writeFile.mockRejectedValue(new Error('storage down'));

    const output = buildLargeOutput();
    const serialized = JSON.stringify(output);

    const result = await service.spillIfTooLarge(
      output,
      { workspaceId: WORKSPACE_ID },
      { toolName: 'find_many_companies' },
    );

    const truncated = result.result as Record<string, unknown>;
    const content = truncated.content as string;

    expect(truncated.truncated).toBe(true);
    expect(truncated.originalSizeBytes).toBe(Buffer.byteLength(serialized));
    expect(Buffer.byteLength(content)).toBeLessThanOrEqual(
      MAX_INLINE_TOOL_OUTPUT_BYTES,
    );
    expect(content.startsWith(serialized.slice(0, 100))).toBe(true);
    expect(content.endsWith(serialized.slice(-100))).toBe(true);
    expect(content).toContain(`${Buffer.byteLength(serialized)} bytes`);
    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThan(
      Buffer.byteLength(serialized),
    );
    expect(result.warnings).toEqual([
      'Large output spill failed; the output was truncated inline.',
    ]);
  });

  it('keeps pre-existing warnings when the spill write fails', async () => {
    writeFile.mockRejectedValue(new Error('storage down'));

    const output: ToolOutput = {
      ...buildLargeOutput(),
      warnings: ['existing warning'],
    };

    const result = await service.spillIfTooLarge(
      output,
      { workspaceId: WORKSPACE_ID },
      { toolName: 'find_many_companies' },
    );

    expect(result.warnings).toEqual([
      'existing warning',
      'Large output spill failed; the output was truncated inline.',
    ]);
  });
});
