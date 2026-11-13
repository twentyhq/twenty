import { type AiSdkPackage } from 'twenty-shared/ai';

import { type ModelFileLimits } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/model-file-limits.type';
import {
  AI_SDK_BEDROCK,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';

const ONE_MEGABYTE = 1024 * 1024;

const DEFAULT_MODEL_FILE_LIMITS: ModelFileLimits = {
  maxFileSizeBytes: 32 * ONE_MEGABYTE,
  maxTotalSizeBytes: 50 * ONE_MEGABYTE,
  maxFileCount: 20,
  mimeTypesRequiringUrl: new Set(),
};

export const getModelFileLimits = (
  sdkPackage: AiSdkPackage,
): ModelFileLimits => {
  switch (sdkPackage) {
    case AI_SDK_BEDROCK:
      return {
        ...DEFAULT_MODEL_FILE_LIMITS,
        maxFileSizeBytes: 4.5 * ONE_MEGABYTE,
        maxTotalSizeBytes: 22.5 * ONE_MEGABYTE,
        maxFileCount: 5,
      };
    case AI_SDK_XAI:
      return {
        ...DEFAULT_MODEL_FILE_LIMITS,
        mimeTypesRequiringUrl: new Set(['application/pdf']),
      };
    default:
      return DEFAULT_MODEL_FILE_LIMITS;
  }
};
