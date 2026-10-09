import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const selectTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const trigger = canvas.getByRole('combobox', { name: 'Account stage' });
  const status = canvas.getByRole('status', { name: 'Stage selection' });
  const form = canvas.getByRole('form', {
    name: 'Account classification',
  }) as HTMLFormElement;

  expect(trigger.tagName).toBe('BUTTON');
  expect(trigger).toHaveAttribute('data-native-trigger', 'stage');
  expect(trigger).toHaveTextContent('New');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(new FormData(form).get('stage')).toBe('new');
  expect(new FormData(form).getAll('segments')).toEqual(['priority']);

  await userEvent.click(trigger);
  const qualified = await page.findByRole('option', { name: 'Qualified' });
  const archived = page.getByRole('option', { name: 'Archived' });
  await waitFor(() => expect(qualified).toBeVisible());
  expect(qualified.tagName).toBe('LI');
  expect(archived).toHaveAttribute('aria-disabled', 'true');
  expect(qualified.closest('[data-select-positioner="stage"]')).toHaveStyle({
    position: 'fixed',
  });

  await userEvent.click(archived);
  await waitForSandboxRoundTrip();
  expect(status).toHaveTextContent('Stage: new; Changes: 0; Reason: none');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await userEvent.click(qualified);
  await waitFor(() => {
    expect(status).toHaveTextContent(
      'Stage: qualified; Changes: 1; Reason: item-press; Event: click; Refs: stage/stage/qualified',
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  expect(trigger).toHaveTextContent('Qualified');
  expect(new FormData(form).get('stage')).toBe('qualified');

  await userEvent.click(canvas.getByRole('button', { name: 'Clear stage' }));
  await waitFor(() => expect(trigger).toHaveTextContent('Choose a stage'));
  expect(status).toHaveTextContent('Stage: empty; Changes: 1');
  expect(new FormData(form).get('stage')).toBe('');

  await userEvent.click(trigger);
  const newStage = await page.findByRole('option', { name: 'New' });
  await waitFor(() => expect(newStage).toBeVisible());
  expect(newStage.tagName).toBe('BUTTON');
  await userEvent.keyboard('q');
  await waitFor(() =>
    expect(page.getByRole('option', { name: 'Qualified' })).toHaveFocus(),
  );
  await userEvent.keyboard('{Home}');
  await waitFor(() => expect(newStage).toHaveFocus());
  await userEvent.keyboard('{Enter}');
  await waitFor(() => {
    expect(status).toHaveTextContent(
      'Stage: new; Changes: 2; Reason: item-press; Event: click',
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  expect(new FormData(form).get('stage')).toBe('new');

  const segmentsTrigger = canvas.getByRole('combobox', {
    name: 'Account segments',
  });
  await userEvent.click(segmentsTrigger);
  await userEvent.click(await page.findByRole('option', { name: 'Renewal' }));
  const segmentsStatus = canvas.getByRole('status', {
    name: 'Segment selection',
  });
  await waitFor(() =>
    expect(segmentsStatus).toHaveTextContent('Segments: priority, renewal'),
  );
  expect(segmentsTrigger).toHaveAttribute('aria-expanded', 'true');
  expect(segmentsTrigger).toHaveTextContent('Priority');
  expect(segmentsTrigger).toHaveTextContent('Renewal');
  expect(new FormData(form).getAll('segments')).toEqual([
    'priority',
    'renewal',
  ]);
  await userEvent.click(page.getByRole('option', { name: 'Priority' }));
  await waitFor(() =>
    expect(segmentsStatus).toHaveTextContent('Segments: renewal'),
  );
  expect(new FormData(form).getAll('segments')).toEqual(['renewal']);
  await userEvent.click(segmentsTrigger);
  await waitFor(() =>
    expect(segmentsTrigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(errorHandler).not.toHaveBeenCalled();
};
