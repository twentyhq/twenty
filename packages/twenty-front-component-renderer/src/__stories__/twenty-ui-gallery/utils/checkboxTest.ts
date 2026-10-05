import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expectSandboxErrors } from '@/__stories__/twenty-ui-gallery/utils/expectSandboxErrors';
import { expect, userEvent, within } from 'storybook/test';

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
  await expectSandboxErrors({
    requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
  });
  expect(canvas.getByRole('status')).toHaveTextContent(
    'Selection: unselected; Changes: 0',
  );
};
