import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useRecoilValue } from 'recoil';
import { type SelectOption } from 'twenty-ui/input';

import {
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
} from '@/ai/constants/aiModelConstants';

export const useAiModelOptions = (): SelectOption<string>[] => {
  const aiModels = useRecoilValue(aiModelsState);

  return aiModels
    .map((model) => ({
      value: model.modelId,
      label:
        model.modelId === DEFAULT_FAST_MODEL ||
        model.modelId === DEFAULT_SMART_MODEL
          ? model.label
          : `${model.label} (${model.provider})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
