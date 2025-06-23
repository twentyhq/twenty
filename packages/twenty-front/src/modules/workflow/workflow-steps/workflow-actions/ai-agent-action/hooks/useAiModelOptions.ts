import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useRecoilValue } from 'recoil';
import { SelectOption } from 'twenty-ui/input';

export const useAiModelOptions = (): SelectOption<string>[] => {
  const aiModels = useRecoilValue(aiModelsState);

  return aiModels
    .map((model) => ({
      value: model.modelId,
      label: `${model.label} (${model.provider})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
