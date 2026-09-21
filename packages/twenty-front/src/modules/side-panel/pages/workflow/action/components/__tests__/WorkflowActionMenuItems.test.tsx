import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowActionMenuItems } from '@/side-panel/pages/workflow/action/components/WorkflowActionMenuItems';

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual('twenty-ui/icon'),
  useIcons: () => ({ getIcon: () => () => null }),
}));

it('explains unavailable classification and prevents selection', async () => {
  const onClick = jest.fn();
  render(
    <WorkflowActionMenuItems
      actions={[
        {
          type: 'CLASSIFY',
          defaultLabel: 'Classify',
          icon: 'IconCategory',
          disabled: true,
          description: 'Needs a TypeSafe AI API key',
          tooltip: 'Ask your administrator to configure the key.',
        },
      ]}
      onClick={onClick}
    />,
  );
  expect(screen.getByText('Needs a TypeSafe AI API key')).toBeVisible();
  await userEvent.click(screen.getByText('Classify'));
  expect(onClick).not.toHaveBeenCalled();
});

it('allows configured classification to be selected', async () => {
  const onClick = jest.fn();
  render(
    <WorkflowActionMenuItems
      actions={[
        {
          type: 'CLASSIFY',
          defaultLabel: 'Classify',
          icon: 'IconCategory',
        },
      ]}
      onClick={onClick}
    />,
  );
  await userEvent.click(screen.getByText('Classify'));
  expect(onClick).toHaveBeenCalledWith('CLASSIFY');
});
