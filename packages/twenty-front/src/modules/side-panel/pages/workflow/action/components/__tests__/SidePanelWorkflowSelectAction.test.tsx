import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
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
    WorkflowActionMenuItems: ({
      actions,
      onClick,
    }: {
      actions: { defaultLabel: string; type: string }[];
      onClick: (actionType: string) => void;
    }) => (
      <>
        {actions.map((action) => (
          <button
            key={action.defaultLabel}
            onClick={() => onClick(action.type)}
          >
            {action.defaultLabel}
          </button>
        ))}
      </>
    ),
  }),
);

const renderPicker = (onActionSelected = jest.fn()) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <SidePanelWorkflowSelectAction onActionSelected={onActionSelected} />
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

  it("defaults a new Create Calendar Event step to the user's time zone", async () => {
    jotaiStore.set(workspaceMemberFormatPreferencesState.atom, {
      ...jotaiStore.get(workspaceMemberFormatPreferencesState.atom),
      timeZone: 'Europe/Paris',
    });
    const onActionSelected = jest.fn();

    renderPicker(onActionSelected);

    await userEvent.click(screen.getByText('Create Calendar Event'));

    expect(onActionSelected).toHaveBeenCalledTimes(1);
    expect(onActionSelected).toHaveBeenCalledWith({
      type: 'CREATE_CALENDAR_EVENT',
      defaultSettings: { input: { timeZone: 'Europe/Paris' } },
    });
  });

  it('creates other steps without default settings', async () => {
    const onActionSelected = jest.fn();

    renderPicker(onActionSelected);

    await userEvent.click(screen.getByText('Send Email'));

    expect(onActionSelected).toHaveBeenCalledTimes(1);
    expect(onActionSelected).toHaveBeenCalledWith({ type: 'SEND_EMAIL' });
  });
});
