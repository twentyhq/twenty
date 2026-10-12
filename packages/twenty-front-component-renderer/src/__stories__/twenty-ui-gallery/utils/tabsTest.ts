import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectAssertionToKeepFailing } from '@/__stories__/twenty-ui-gallery/utils/expectAssertionToKeepFailing';
import { tabButtonTest } from '@/__stories__/twenty-ui-gallery/utils/tabButtonTest';

export const tabsTest: TwentyUiGalleryPlayFunction = async (context) => {
  const canvas = within(context.canvasElement);
  await expectFrontComponentMounted(canvas);

  const root = canvas.getByTestId('controlled-tabs-root');
  const list = canvas.getByRole('tablist', { name: 'Account sections' });
  const overview = within(list).getByRole('tab', { name: 'Overview' });
  const activity = within(list).getByRole('tab', { name: 'Activity' });
  const unavailable = within(list).getByRole('tab', { name: 'Unavailable' });
  const overviewPanel = canvas.getByRole('tabpanel', { name: 'Overview' });
  const activityPanel = root.querySelector('#account-activity-panel')!;
  const indicator = within(list).getByTestId('account-indicator');

  expect(root.tagName).toBe('SECTION');
  expect(root).toHaveAttribute('title', 'Controlled account panels');
  expect(root).toHaveAttribute('data-ref-target', 'tabs-root');
  expect(list.tagName).toBe('NAV');
  expect(list).toHaveAttribute('data-ref-target', 'tabs-list');
  expect(overview.tagName).toBe('BUTTON');
  expect(overview).toHaveAttribute('data-ref-target', 'tabs-tab');
  expect(overview).toHaveAttribute('data-native-owner', 'overview');
  expect(overview).toHaveAttribute('aria-controls', overviewPanel.id);
  expect(overviewPanel.tagName).toBe('ARTICLE');
  expect(overviewPanel).toHaveAttribute('aria-labelledby', overview.id);
  expect(overviewPanel).toHaveAttribute('data-ref-target', 'tabs-panel');
  expect(indicator.tagName).toBe('SPAN');
  expect(indicator).toHaveAttribute('data-ref-target', 'tabs-indicator');
  expect(indicator).toHaveAttribute('data-render-orientation', 'horizontal');
  expect(
    list.querySelectorAll('[data-ref-target="tabs-indicator"]'),
  ).toHaveLength(1);
  expect(overview).toHaveAttribute('aria-selected', 'true');
  expect(unavailable).toHaveAttribute('aria-disabled', 'true');
  expect(activityPanel).not.toBeVisible();
  expect(activityPanel).toHaveAttribute('data-render-hidden', 'true');
  expect(activityPanel.getBoundingClientRect().height).toBe(0);

  await waitFor(() => {
    expect(overview.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(activity.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(overview.getBoundingClientRect().left).toBeLessThan(
      activity.getBoundingClientRect().left,
    );
  });
  await expectAssertionToKeepFailing(() =>
    expect(indicator.getBoundingClientRect().width).toBeGreaterThan(0),
  );
  await userEvent.click(overview);
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => expect(activity).toHaveFocus());
  expect(overview).toHaveAttribute('aria-selected', 'true');
  expect(canvas.getByLabelText('Controlled change count')).toHaveTextContent(
    '0',
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Tabs native key')).toHaveTextContent(
      'ArrowRight',
    ),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() => {
    expect(activity).toHaveAttribute('aria-selected', 'true');
    expect(canvas.getByLabelText('Controlled selection')).toHaveTextContent(
      'activity',
    );
    expect(canvas.getByLabelText('Controlled change count')).toHaveTextContent(
      '1',
    );
    expect(
      canvas.getByLabelText('Controlled change details').textContent,
    ).toMatch(/^activity:none:(click|keydown):left$/);
    expect(canvas.getByRole('tabpanel', { name: 'Activity' })).toBe(
      activityPanel,
    );
    expect(activityPanel).toHaveAttribute('aria-labelledby', activity.id);
    expect(activity).toHaveAttribute('aria-controls', activityPanel.id);
    expect(activityPanel).toHaveAttribute('data-render-hidden', 'false');
    expect(overviewPanel).not.toBeVisible();
  });
  await expectAssertionToKeepFailing(() =>
    expect(
      canvas.getByLabelText('Controlled change details').textContent,
    ).toMatch(/^activity:none:(click|keydown):right$/),
  );
  await userEvent.click(activity);
  expect(canvas.getByLabelText('Controlled change count')).toHaveTextContent(
    '1',
  );

  await userEvent.keyboard('{Home}');
  await waitFor(() => expect(overview).toHaveFocus());
  expect(activity).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{End}');
  await waitFor(() => expect(activity).toHaveFocus());
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => expect(overview).toHaveFocus());
  expect(activity).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard(' ');
  await waitFor(() => {
    expect(overview).toHaveAttribute('aria-selected', 'true');
    expect(canvas.getByLabelText('Controlled change count')).toHaveTextContent(
      '2',
    );
  });
  await userEvent.click(unavailable);
  await expectAssertionToKeepFailing(() =>
    expect(canvas.getByLabelText('Controlled selection')).toHaveTextContent(
      'disabled',
    ),
  );

  await userEvent.click(activity);
  await waitFor(() =>
    expect(activity).toHaveAttribute('aria-selected', 'true'),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Select overview externally' }),
  );
  await waitFor(() =>
    expect(overview).toHaveAttribute('aria-selected', 'true'),
  );
  expect(canvas.getByLabelText('Controlled change count')).toHaveTextContent(
    '3',
  );

  const vertical = canvas.getByRole('tablist', {
    name: 'Automatic vertical sections',
  });
  const first = within(vertical).getByRole('tab', { name: 'First section' });
  const second = within(vertical).getByRole('tab', { name: 'Second section' });
  const blocked = within(vertical).getByRole('tab', {
    name: 'Blocked section',
  });
  expect(vertical).toHaveAttribute('aria-orientation', 'vertical');
  await userEvent.click(first);
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-selected', 'true');
    const secondPanel = canvas.getByRole('tabpanel', {
      name: 'Second section',
    });
    expect(secondPanel).toBeVisible();
    expect(second).toHaveAttribute('aria-controls', secondPanel.id);
    expect(secondPanel).toHaveAttribute('aria-labelledby', second.id);
    expect(
      canvas.getByLabelText('Automatic change details').textContent,
    ).toMatch(/^second:none:focus(?:in)?:false$/);
  });
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(blocked).toHaveFocus();
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(
      canvas.getByLabelText('Automatic change details').textContent,
    ).toMatch(/^blocked:none:focus(?:in)?:true$/);
  });
  expect(
    canvas.queryByRole('tabpanel', { name: 'Blocked section' }),
  ).not.toBeInTheDocument();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => expect(blocked).toHaveFocus());
  await userEvent.keyboard('{Home}');
  await waitFor(() => {
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute('aria-selected', 'true');
  });
  await userEvent.keyboard('{ArrowUp}');
  await waitFor(() => expect(first).toHaveFocus());
  await userEvent.keyboard('{End}');
  await waitFor(() => {
    expect(blocked).toHaveFocus();
    expect(first).toHaveAttribute('aria-selected', 'true');
  });
  await userEvent.keyboard('{ArrowUp}');
  await waitFor(() => {
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-selected', 'true');
  });

  const rightToLeft = canvas.getByRole('tablist', { name: 'RTL sections' });
  const start = within(rightToLeft).getByRole('tab', { name: 'RTL start' });
  const end = within(rightToLeft).getByRole('tab', { name: 'RTL end' });
  await userEvent.click(start);
  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() => {
    expect(end).toHaveFocus();
    expect(end).toHaveAttribute('aria-selected', 'true');
  });
  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() => {
    expect(start).toHaveFocus();
    expect(start).toHaveAttribute('aria-selected', 'true');
  });
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => {
    expect(end).toHaveFocus();
    expect(end).toHaveAttribute('aria-selected', 'true');
  });

  await tabButtonTest(context);
  expect(errorHandler).not.toHaveBeenCalled();
};
