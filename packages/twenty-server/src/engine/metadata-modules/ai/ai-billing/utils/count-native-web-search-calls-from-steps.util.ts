import { NATIVE_MODEL_TOOLS_BY_SDK_PACKAGE } from 'src/engine/metadata-modules/ai/ai-models/constants/native-model-tools-by-sdk-package.const';
import { type NativeModelTools } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tools.type';

// Every provider-run search tool we attach is billed by the provider, so all of them are metered
const NATIVE_SEARCH_TOOL_NAMES = new Set(
  Object.values<NativeModelTools>(NATIVE_MODEL_TOOLS_BY_SDK_PACKAGE).flatMap(
    (nativeTools) =>
      Object.values(nativeTools).map((nativeTool) => nativeTool.directToolName),
  ),
);

export const countNativeWebSearchCallsFromSteps = (
  steps: { toolCalls: { toolName: string }[] }[],
): number =>
  steps.reduce(
    (count, step) =>
      count +
      step.toolCalls.filter((toolCall) =>
        NATIVE_SEARCH_TOOL_NAMES.has(toolCall.toolName),
      ).length,
    0,
  );
