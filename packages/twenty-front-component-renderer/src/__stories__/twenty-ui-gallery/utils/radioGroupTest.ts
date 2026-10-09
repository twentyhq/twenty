import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const radioGroupTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const group = canvas.getByRole('radiogroup', { name: 'Digest frequency' });
  const daily = within(group).getByRole('radio', { name: 'Daily' });
  const weekly = within(group).getByRole('radio', { name: 'Weekly' });
  const monthly = within(group).getByRole('radio', { name: 'Monthly' });
  const quarterly = within(group).getByRole('radio', { name: 'Quarterly' });

  expect(group.tagName).toBe('FIELDSET');
  expect(group).toHaveAttribute('data-native-owner', 'digest');
  expect(weekly).toBeChecked();
  expect(monthly).toHaveAttribute('aria-disabled', 'true');
  expect(daily).toHaveAttribute('data-selected', 'false');
  expect(canvas.getByTestId('daily-indicator')).toHaveAttribute(
    'data-selected',
    'false',
  );
  await userEvent.click(monthly);
  expect(monthly).not.toBeChecked();

  await userEvent.click(daily);
  await waitFor(() =>
    expect(canvas.getByText('Frequency: daily')).toBeVisible(),
  );
  expect(weekly).not.toBeChecked();
  expect(daily).toBeChecked();
  expect(
    new FormData(
      canvas.getByRole('form', {
        name: 'Digest preferences',
      }) as HTMLFormElement,
    ).get('digest'),
  ).toBe('daily');
  expect(daily).toHaveAttribute('data-selected', 'true');
  expect(canvas.getByTestId('daily-indicator')).toHaveAttribute(
    'data-selected',
    'true',
  );
  expect(
    canvas.getByText(
      /Frequency changes: 1; Callback: none\/(click|change); Targets: HTML-FIELDSET\/HTML-SPAN\/HTML-INPUT\/HTML-SPAN/,
    ),
  ).toBeVisible();

  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(weekly).toHaveFocus();
    expect(weekly).toBeChecked();
  });
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(quarterly).toHaveFocus();
    expect(quarterly).toBeChecked();
  });
  expect(
    new FormData(
      canvas.getByRole('form', {
        name: 'Digest preferences',
      }) as HTMLFormElement,
    ).get('digest'),
  ).toBe('quarterly');
  expect(monthly).not.toBeChecked();
  expect(canvas.getByText('Frequency: quarterly')).toBeVisible();
  await userEvent.keyboard('{ArrowDown}');
  await waitFor(() => {
    expect(daily).toHaveFocus();
    expect(daily).toBeChecked();
  });

  const summary = canvas.getByRole('radio', { name: 'Summary' });
  const fullDetail = canvas.getByRole('radio', { name: 'Full detail' });
  await userEvent.click(summary);
  await userEvent.keyboard('{ArrowLeft}');
  await waitFor(() => {
    expect(fullDetail).toHaveFocus();
    expect(fullDetail).toBeChecked();
  });
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => expect(summary).toBeChecked());

  const enableSummaries = canvas.getByRole('radio', {
    name: 'Enable summaries',
  });
  const requiredForm = canvas.getByRole('form', {
    name: 'Required preferences',
  }) as HTMLFormElement;
  expect(requiredForm.checkValidity()).toBe(false);
  enableSummaries.focus();
  await userEvent.keyboard('{Enter}');
  expect(enableSummaries).not.toBeChecked();
  await userEvent.keyboard(' ');
  await waitFor(() => expect(enableSummaries).toBeChecked());
  expect(requiredForm.checkValidity()).toBe(true);
  expect(new FormData(requiredForm).get('summaries')).toBe('enabled');
  expect(errorHandler).not.toHaveBeenCalled();
};
