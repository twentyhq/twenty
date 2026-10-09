import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const checkboxTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const checkbox = canvas.getByRole('checkbox', { name: 'Select account' });
  const uncontrolled = canvas.getByRole('checkbox', {
    name: 'Uncontrolled selection',
  });
  expect(checkbox).not.toBeChecked();
  expect(uncontrolled).toBeChecked();
  expect(
    canvas.getByRole('checkbox', { name: 'Partial selection' }),
  ).toBePartiallyChecked();
  const disabled = canvas.getByRole('checkbox', {
    name: 'Disabled selection',
  });
  expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(disabled);
  expect(disabled).not.toBeChecked();

  const readOnly = canvas.getByRole('checkbox', {
    name: 'Read-only selection',
  });
  await userEvent.click(readOnly);
  expect(readOnly).toBeChecked();
  expect(errorHandler).not.toHaveBeenCalled();

  await userEvent.click(checkbox);
  await waitFor(() =>
    expect(canvas.getByRole('status')).toHaveTextContent(
      'Selection: selected; Changes: 1',
    ),
  );
  expect(checkbox).toBeChecked();

  await userEvent.click(uncontrolled);
  await waitFor(() => expect(uncontrolled).not.toBeChecked());
  expect(canvas.getByRole('status')).toHaveTextContent(
    /Composition: (click|change)\/true/,
  );
  expect(checkbox).toHaveAttribute('data-active', 'true');
  const customPart = checkbox.querySelector('[data-active]');
  expect(customPart).toHaveAttribute('data-active', 'true');
  expect(canvas.getByText('Mixed selection')).toBeVisible();
  expect(errorHandler).not.toHaveBeenCalled();
};
