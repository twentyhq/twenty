import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectAssertionToKeepFailing } from '@/__stories__/twenty-ui-gallery/utils/expectAssertionToKeepFailing';

export const tabButtonTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const routes = within(
    canvas.getByRole('navigation', { name: 'Account routes' }),
  );
  const route = routes.getByRole('link', { name: 'Account route' });
  const callbackRoute = routes.getByRole('link', { name: 'Activity route' });
  const disabledRoute = routes.getByRole('link', { name: 'Disabled route' });

  expect(route.tagName).toBe('A');
  expect(route).toHaveAttribute('href', '#account-route');
  expect(route).toHaveAttribute('title', 'Current account route');
  expect(route).toHaveAttribute('aria-current', 'page');
  expect(route).toHaveAttribute('data-ref-target', 'route-link');
  expect(route).toHaveAttribute('data-render-ref-target', 'route-link');
  expect(callbackRoute.tagName).toBe('A');
  expect(callbackRoute).toHaveAttribute(
    'data-ref-target',
    'callback-route-link',
  );
  expect(callbackRoute).toHaveAttribute('data-render-disabled', 'false');
  expect(callbackRoute).not.toHaveAttribute('aria-current');
  expect(disabledRoute).toHaveAttribute('aria-disabled', 'true');

  for (const link of [route, callbackRoute, disabledRoute]) {
    expect(link).toHaveAttribute('target', '_self');
    expect(link).not.toHaveAttribute('aria-selected');
    expect(link).not.toHaveAttribute('aria-controls');
  }
  expect(routes.queryByRole('tab')).not.toBeInTheDocument();

  await userEvent.click(route);
  await waitFor(() =>
    expect(canvas.getByLabelText('Route activations')).toHaveTextContent('1'),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Route activations')).toHaveTextContent('3'),
  );
  await expectAssertionToKeepFailing(() =>
    expect(canvas.getByLabelText('Route activations')).toHaveTextContent('2'),
  );
  await userEvent.click(callbackRoute);
  await waitFor(() =>
    expect(canvas.getByLabelText('Route activations')).toHaveTextContent('4'),
  );
  await userEvent.click(disabledRoute);
  await expectAssertionToKeepFailing(() =>
    expect(canvas.getByLabelText('Route activations')).toHaveTextContent('5'),
  );

  const action = canvas.getByRole('button', { name: 'Create related panel' });
  const moreAction = canvas.getByRole('button', { name: 'More actions' });
  expect(action.tagName).toBe('BUTTON');
  expect(action).toHaveAttribute('type', 'button');
  expect(action).toHaveAttribute('data-ref-target', 'tab-action');
  for (const button of [action, moreAction]) {
    expect(button).not.toHaveAttribute('aria-selected');
    expect(button).not.toHaveAttribute('aria-controls');
    expect(button).not.toHaveAttribute('aria-current');
  }
  await waitFor(() => {
    expect(action).toHaveAttribute('data-size', 'md');
    expect(moreAction).toHaveAttribute('data-size', 'sm');
    expect(
      within(action).getByText('Create related panel').parentElement,
    ).toHaveStyle({ paddingBlockStart: '8px', paddingBlockEnd: '8px' });
    expect(
      within(moreAction).getByText('More actions').parentElement,
    ).toHaveStyle({
      paddingBlockStart: '4px',
      paddingBlockEnd: '4px',
    });
  });
  await userEvent.click(action);
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard(' ');
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Adjacent action activations'),
    ).toHaveTextContent('3'),
  );
};
