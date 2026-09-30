import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';

const STEP: StepOutputSchemaV2 = {
  id: 'code',
  name: 'Run code',
  type: 'CODE',
  outputSchema: {
    result: {
      isLeaf: false,
      label: 'Result',
      type: 'object',
      value: {
        companyName: {
          isLeaf: true,
          label: 'Company name',
          type: 'string',
          value: 'Acme',
        },
      },
    },
  },
};

let mockSteps: StepOutputSchemaV2[] = [];

jest.mock(
  '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep',
  () => ({
    useAvailableVariablesInWorkflowStep: () => mockSteps,
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock(
  '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation',
  () => ({
    useSidePanelWorkflowNavigation: () => ({
      openWorkflowEditStepInSidePanel: jest.fn(),
    }),
  }),
);

const renderVariables = ({
  onVariableSelect = jest.fn(),
  disabled = false,
}: {
  onVariableSelect?: (variable: string) => void;
  disabled?: boolean;
} = {}) => {
  render(
    <Provider>
      <I18nProvider i18n={i18n}>
        <WorkflowVisualizerComponentInstanceContext.Provider
          value={{ instanceId: 'workflow' }}
        >
          <input aria-label="Editor" />
          <WorkflowVariablesDropdown
            instanceId="variables"
            onVariableSelect={onVariableSelect}
            shouldDisplayRecordFields
            shouldDisplayRecordObjects={false}
            disabled={disabled}
          />
        </WorkflowVisualizerComponentInstanceContext.Provider>
      </I18nProvider>
    </Provider>,
  );
};

describe('WorkflowVariablesDropdown', () => {
  beforeEach(() => {
    mockSteps = [STEP];
  });

  it('returns to the initial step and clears the path and search after dismissal', async () => {
    const user = userEvent.setup();
    renderVariables();
    const trigger = screen.getByRole('button', { name: 'Insert variable' });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Result' }));
    await user.type(screen.getByRole('searchbox'), 'Company');
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Run code' })).toBeVisible();
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Result' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Company name/ }),
    ).not.toBeInTheDocument();
  });

  it('returns to the step list when reopening a picker with multiple steps', async () => {
    mockSteps = [
      STEP,
      { ...STEP, id: 'trigger', name: 'Manual trigger', type: 'MANUAL' },
    ];
    const user = userEvent.setup();
    renderVariables();
    const trigger = screen.getByRole('button', { name: 'Insert variable' });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Run code' }));
    await user.click(screen.getByRole('button', { name: 'Result' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Select Step' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Manual trigger' }),
    ).toBeVisible();
  });

  it('inserts the first matching variable with Enter and keeps focus in the editor', async () => {
    const user = userEvent.setup();
    const onVariableSelect = jest.fn(() =>
      screen.getByRole('textbox', { name: 'Editor' }).focus(),
    );
    renderVariables({ onVariableSelect });

    await user.click(screen.getByRole('button', { name: 'Insert variable' }));
    await user.type(screen.getByRole('searchbox'), 'Company name');
    await user.keyboard('{Enter}');

    expect(onVariableSelect).toHaveBeenCalledWith(
      '{{code.result.companyName}}',
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('textbox', { name: 'Editor' })).toHaveFocus();
  });

  it('uses Back to move up an output path without closing the picker', async () => {
    const user = userEvent.setup();
    renderVariables();

    await user.click(screen.getByRole('button', { name: 'Insert variable' }));
    await user.click(screen.getByRole('button', { name: 'Result' }));
    expect(screen.getByRole('button', { name: /Company name/ })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('dialog', { name: 'Run code' })).toBeVisible();
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Result' })).toBeVisible();
  });

  it('shows the unavailable-variables hint without an interactive trigger', async () => {
    mockSteps = [];
    const user = userEvent.setup();
    const { container } = render(
      <Provider>
        <WorkflowVariablesDropdown
          instanceId="empty"
          onVariableSelect={jest.fn()}
          shouldDisplayRecordFields
          shouldDisplayRecordObjects={false}
        />
      </Provider>,
    );

    expect(
      screen.queryByRole('button', { name: 'Insert variable' }),
    ).not.toBeInTheDocument();
    await user.hover(
      container.querySelector(
        '[data-variable-picker-disabled-anchor]',
      ) as HTMLElement,
    );
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'No variables are available yet.',
    );
  });
});
