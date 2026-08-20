import { WorkflowDiagramStepNodeOptionsDropdown } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeOptionsDropdown';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

describe('WorkflowDiagramStepNodeOptionsDropdown', () => {
  it('only shows the duplicate action when the node can be duplicated', async () => {
    render(
      <I18nProvider i18n={i18n}>
        <JotaiProvider>
          <WorkflowDiagramStepNodeOptionsDropdown
            onChangeNode={jest.fn()}
            onDelete={jest.fn()}
          />
        </JotaiProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Node options' }));

    await screen.findByText('Change node');
    expect(screen.queryByText('Duplicate node')).not.toBeInTheDocument();
  });

  it('runs the selected action from the keyboard', async () => {
    const onChangeNode = jest.fn();
    const onDuplicateNode = jest.fn();
    const onDelete = jest.fn();

    render(
      <I18nProvider i18n={i18n}>
        <JotaiProvider>
          <WorkflowDiagramStepNodeOptionsDropdown
            onChangeNode={onChangeNode}
            onDuplicateNode={onDuplicateNode}
            onDelete={onDelete}
          />
        </JotaiProvider>
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Node options' }));

    await screen.findByText('Duplicate node');

    fireEvent.keyDown(document, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(onDuplicateNode).toHaveBeenCalledTimes(1));
    expect(onChangeNode).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
