import { MAX_INLINE_TOOL_OUTPUT_BYTES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/max-inline-tool-output-bytes.constant';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { truncateHeadTail } from 'src/engine/core-modules/tool/utils/truncate-head-tail.util';

// Keeps the envelope valid JSON: the truncated text goes in a field rather than
// replacing the serialized output, which callers parse.
export const buildTruncatedToolOutput = ({
  output,
  serialized,
  sizeBytes,
  guidance,
  maxBytes = MAX_INLINE_TOOL_OUTPUT_BYTES,
}: {
  output: ToolOutput;
  serialized: string;
  sizeBytes: number;
  guidance: string;
  maxBytes?: number;
}): ToolOutput => ({
  success: output.success,
  message: output.message,
  result: {
    truncated: true,
    originalSizeBytes: sizeBytes,
    content: truncateHeadTail({
      text: serialized,
      maxBytes,
      guidance,
    }),
  },
});
