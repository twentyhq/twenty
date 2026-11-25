import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import { aiModelsState } from '@/client-config/states/aiModelsState';
import { CoreAgentModelCell } from '@/object-core/agents/components/CoreAgentModelCell';

describe('CoreAgentModelCell', () => {
  it.each([
    {
      modelId: 'story/reasoning@high',
      expectedLabel: 'Reasoning Model · High',
    },
    {
      modelId: 'story/reasoning@low',
      expectedLabel: 'story/reasoning@low',
    },
  ])('displays $expectedLabel for $modelId', ({ modelId, expectedLabel }) => {
    const store = createStore();

    store.set(aiModelsState.atom, [
      {
        modelId: 'story/reasoning',
        label: 'Reasoning Model',
        efforts: ['high'],
      },
      {
        modelId: 'story/reasoning@high',
        label: 'Reasoning Model (high reasoning)',
        effort: 'high',
      },
    ]);

    render(
      <I18nProvider i18n={i18n}>
        <Provider store={store}>
          <CoreAgentModelCell modelId={modelId} />
        </Provider>
      </I18nProvider>,
    );

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
