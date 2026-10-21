import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';

export const dropdownSelectionEventsTest = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);
  const trigger = canvas.getByRole('button', {
    name: 'Inspect selection events',
  });
  trigger.focus();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(errorHandler).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  const search = await page.findByRole('searchbox', {
    name: 'Search event people',
  });
  const ada = page.getByRole('option', { name: 'Ada Lovelace' });
  const grace = page.getByRole('option', { name: 'Grace Hopper' });
  await waitFor(() => expect(search).toHaveFocus());
  expect(search).toHaveValue('Ada');
  await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
  await waitFor(() => expect(ada).toHaveAttribute('aria-selected', 'true'));
  expect(canvas.getByLabelText('Event selection')).toHaveTextContent(
    'Ada Lovelace',
  );
  expect(canvas.getByLabelText('Selection event')).toHaveTextContent(
    'item-press/keydown/Enter/true',
  );
  expect(canvas.getByLabelText('Selection target')).toHaveTextContent('search');
  expect(canvas.getByLabelText('Selection trigger')).toHaveTextContent(
    'Ada Lovelace',
  );
  expect(canvas.getByLabelText('Selection identity')).toHaveTextContent(
    'true/true',
  );
  expect(canvas.getByLabelText('Selection click')).toHaveTextContent(
    'click/true/false',
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await userEvent.click(grace);
  await waitFor(() => expect(grace).toHaveAttribute('aria-selected', 'true'));
  expect(canvas.getByLabelText('Event selection')).toHaveTextContent(
    'Grace Hopper',
  );
  expect(canvas.getByLabelText('Selection event')).toHaveTextContent(
    'item-press/click/pointer/false',
  );
  expect(canvas.getByLabelText('Selection target')).toHaveTextContent('option');
  expect(canvas.getByLabelText('Selection trigger')).toHaveTextContent(
    'Grace Hopper',
  );
  expect(canvas.getByLabelText('Selection identity')).toHaveTextContent(
    'false/true',
  );
  expect(canvas.getByLabelText('Selection click')).toHaveTextContent(
    'click/true/true',
  );
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
