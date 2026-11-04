import { reconcileCoreAgentFormValues } from '@/object-core/agents/utils/reconcileCoreAgentFormValues';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

const previousValues: CoreAgentFormValues = {
  name: 'assistant',
  label: 'Assistant',
  description: 'Saved description',
  modelId: 'model',
  prompt: 'Saved instructions',
  modelConfiguration: { webSearch: { enabled: false } },
  triggers: [],
};

it('refreshes unchanged fields while keeping pending field and capability edits', () => {
  const localValues = {
    ...previousValues,
    description: 'Pending description',
    modelConfiguration: { webSearch: { enabled: true } },
  };
  const serverValues = {
    ...previousValues,
    label: 'Updated assistant',
    prompt: 'Updated instructions',
  };

  expect(
    reconcileCoreAgentFormValues({ previousValues, localValues, serverValues }),
  ).toEqual({
    ...serverValues,
    description: localValues.description,
    modelConfiguration: localValues.modelConfiguration,
  });
});

it('accepts later server changes after the pending edit has been saved', () => {
  const acknowledgedValues = {
    ...previousValues,
    description: 'Saved local edit',
  };
  const serverValues = {
    ...acknowledgedValues,
    description: 'Later remote edit',
  };

  expect(
    reconcileCoreAgentFormValues({
      previousValues: acknowledgedValues,
      localValues: acknowledgedValues,
      serverValues,
    }).description,
  ).toBe('Later remote edit');
});
