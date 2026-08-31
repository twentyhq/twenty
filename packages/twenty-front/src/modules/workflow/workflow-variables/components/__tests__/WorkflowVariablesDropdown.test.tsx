import { WorkflowVariablesDropdown } from '@/workflow/workflow-variables/components/WorkflowVariablesDropdown';
import { useAvailableVariablesInWorkflowStep } from '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({ dropdownComponents }: { dropdownComponents: ReactNode }) =>
    dropdownComponents,
}));
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: jest.fn() }),
}));
jest.mock(
  '@/workflow/workflow-variables/hooks/useAvailableVariablesInWorkflowStep',
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
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => undefined,
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => jest.fn(),
}));

describe('WorkflowVariablesDropdown', () => {
  it('searches nested fields when the only available step opens automatically', async () => {
    jest.mocked(useAvailableVariablesInWorkflowStep).mockReturnValue([
      {
        id: 'code',
        name: 'Run code',
        type: 'CODE',
        outputSchema: {
          result: {
            isLeaf: false,
            type: 'object',
            label: 'Result',
            value: {
              employees: {
                isLeaf: true,
                label: 'Employees',
                type: 'number',
                value: 5,
              },
            },
          },
        },
      },
    ]);
    const user = userEvent.setup();
    const onVariableSelect = jest.fn();
    render(
      <I18nProvider i18n={i18n}>
        <WorkflowVariablesDropdown
          instanceId="variables"
          onVariableSelect={onVariableSelect}
          shouldDisplayRecordFields
          shouldDisplayRecordObjects={false}
        />
      </I18nProvider>,
    );

    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.queryByText('Employees')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), ' EMPLOYEES ');
    expect(
      screen.getByText('Run code / Result', { exact: false }),
    ).toBeInTheDocument();
    await user.click(screen.getByText('Employees'));
    expect(onVariableSelect).toHaveBeenCalledWith('{{code.result.employees}}');
  });
});
