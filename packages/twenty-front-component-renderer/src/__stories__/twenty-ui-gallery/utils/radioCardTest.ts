import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const radioCardTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const plan = within(canvas.getByRole('radiogroup', { name: 'Plan' }));
  const basic = plan.getByRole('radio', { name: 'Basic plan' });
  const pro = plan.getByRole('radio', { name: 'Pro plan' });

  expect(basic.tagName).toBe('SPAN');
  expect(basic).toBeChecked();
  expect(pro.tagName).toBe('BUTTON');
  expect(pro).toHaveAttribute('type', 'button');
  expect(pro).toHaveAttribute('data-native-owner', 'plan');
  pro.focus();
  await userEvent.keyboard('{Enter}');
  expect(basic).toBeChecked();
  expect(pro).not.toBeChecked();
  await userEvent.keyboard(' ');
  await waitFor(() =>
    expect(
      canvas.getByText('Plan: pro; Targets: HTML-BUTTON/HTML-INPUT'),
    ).toBeVisible(),
  );
  expect(pro).toBeChecked();
  expect(basic).not.toBeChecked();
  expect(
    new FormData(
      canvas.getByRole('form', {
        name: 'Digest preferences',
      }) as HTMLFormElement,
    ).get('plan'),
  ).toBe('pro');

  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => {
    expect(basic).toHaveFocus();
    expect(basic).toBeChecked();
  });
  expect(pro).not.toBeChecked();
  expect(errorHandler).not.toHaveBeenCalled();
};
