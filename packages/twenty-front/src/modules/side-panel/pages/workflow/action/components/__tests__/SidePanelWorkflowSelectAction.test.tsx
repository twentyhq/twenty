import { i18n, type MessageDescriptor } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { SidePanelWorkflowSelectAction } from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

let mockFeatureFlagsMap: Record<string, boolean> = {};

jest.mock('@/workspace/hooks/useWorkspaceFeatureFlagsMap', () => ({
  useWorkspaceFeatureFlagsMap: () => mockFeatureFlagsMap,
}));

jest.mock(
  '@/side-panel/pages/workflow/action/components/WorkflowActionMenuItems',
  () => ({
    // The action labels are message descriptors, translated like the real component does
    WorkflowActionMenuItems: ({
      actions,
    }: {
      actions: {
        defaultLabel: MessageDescriptor;
        type: string;
      }[];
    }) => {
      const { i18n: mockI18n } = jest.requireActual('@lingui/core');

      return (
        <>
          {actions.map((action) => (
            <div key={action.type}>{mockI18n._(action.defaultLabel)}</div>
          ))}
        </>
      );
    },
  }),
);

const renderPicker = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <SidePanelWorkflowSelectAction onActionSelected={jest.fn()} />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('SidePanelWorkflowSelectAction', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockFeatureFlagsMap = {};
  });

  it('hides Wait for Event while the inbox feature flag is off', () => {
    renderPicker();

    expect(screen.queryByText('Wait for Event')).not.toBeInTheDocument();
    expect(screen.getByText('Delay')).toBeInTheDocument();
  });

  it('offers Wait for Event once the inbox feature flag is on', () => {
    mockFeatureFlagsMap = { [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: true };

    renderPicker();

    expect(screen.getByText('Wait for Event')).toBeInTheDocument();
  });
});
