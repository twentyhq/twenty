import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { WorkflowDiagramStepNodeOptionsDropdown } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeOptionsDropdown';

const renderNodeOptions = ({
  onDuplicateNode,
}: { onDuplicateNode?: () => void } = {}) => {
  const onParentClick = jest.fn();
  const onChangeNode = jest.fn();
  const onDelete = jest.fn();
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <div onClick={onParentClick}>
          <WorkflowDiagramStepNodeOptionsDropdown
            onChangeNode={onChangeNode}
            onDuplicateNode={onDuplicateNode}
            onDelete={onDelete}
          />
        </div>
      </Provider>
    </I18nProvider>,
  );
  return { user: userEvent.setup(), onParentClick, onChangeNode, onDelete };
};

describe('WorkflowDiagramStepNodeOptionsDropdown', () => {
  it('opens on release, contains popup clicks, and retains the node click-outside exclusion', async () => {
    const onDuplicateNode = jest.fn();
    const { user, onParentClick } = renderNodeOptions({ onDuplicateNode });
    const trigger = screen.getByRole('button', { name: 'Node options' });
    await user.pointer({ target: trigger, keys: '[MouseLeft>]' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.pointer({ target: trigger, keys: '[/MouseLeft]' });

    expect(await screen.findByRole('menu')).toHaveAttribute(
      'data-click-outside-id',
      WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID,
    );
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate node' }));
    expect(onDuplicateNode).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('navigates only available actions and restores focus after Escape', async () => {
    const { user, onChangeNode, onDelete } = renderNodeOptions();
    const trigger = screen.getByRole('button', { name: 'Node options' });
    await user.click(trigger);
    await screen.findByRole('menuitem', { name: 'Change node' });
    expect(
      screen.queryByRole('menuitem', { name: 'Duplicate node' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onChangeNode).not.toHaveBeenCalled();

    await user.click(trigger);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
