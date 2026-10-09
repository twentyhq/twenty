import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const cardCompositionTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const displayCard = canvas.getByTitle('Display card');
  const displayHeader = canvas.getByTitle('Display header');
  const displayContent = canvas.getByTitle('Display content');
  const displayFooter = canvas.getByTitle('Display footer');

  expect(displayCard.tagName).toBe('DIV');
  expect(displayCard).toHaveAttribute('id', 'display-card');
  expect(displayCard).toHaveAttribute('data-full-width');
  expect(displayCard).toHaveAttribute('data-rounded');
  await waitFor(() =>
    expect(getComputedStyle(displayCard).backgroundColor).toBe(
      'rgb(245, 246, 247)',
    ),
  );
  expect(displayCard).not.toHaveAttribute('role');
  expect(displayCard).not.toHaveAttribute('tabindex');
  expect(displayHeader).toHaveAttribute('dir', 'ltr');
  expect(displayContent).toHaveAttribute('data-divider');
  expect(displayFooter).toHaveAttribute('data-no-divider');

  await userEvent.click(canvas.getByRole('button', { name: 'Read card refs' }));
  await waitFor(() =>
    expect(canvas.getByLabelText('Card ref targets')).toHaveTextContent(
      'root/header/content/footer',
    ),
  );
  expect(canvas.getByLabelText('Display card clicks')).toHaveTextContent('1');
  expect(displayCard).not.toHaveAttribute('role');
  expect(displayCard).not.toHaveAttribute('tabindex');

  const composedCard = canvas.getByRole('article', {
    name: 'Composed account',
  });
  const composedContent = within(composedCard).getByRole('region', {
    name: 'Composed account details',
  });

  expect(composedCard.tagName).toBe('ARTICLE');
  expect(canvas.getByTitle('Composed header').tagName).toBe('HEADER');
  expect(composedContent.tagName).toBe('SECTION');
  expect(canvas.getByTitle('Composed footer').tagName).toBe('FOOTER');
  expect(composedCard).not.toHaveAttribute('tabindex');
  await userEvent.click(
    within(composedCard).getByRole('button', { name: 'Follow account' }),
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Account follows')).toHaveTextContent('1'),
  );

  const button = canvas.getByRole('button', { name: 'Open account' });
  const buttonActivations = canvas.getByLabelText('Card button activations');
  const ownerActivations = canvas.getByLabelText('Card owner activations');

  expect(button.tagName).toBe('BUTTON');
  expect(button).toHaveAttribute('type', 'button');
  expect(button.querySelector('button, a')).toBeNull();
  await userEvent.click(button);
  await expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard(' ');
  await waitFor(() => {
    expect(buttonActivations).toHaveTextContent('3');
    expect(ownerActivations).toHaveTextContent('3');
    expect(canvas.getByLabelText('Card native target')).toHaveTextContent(
      'button',
    );
  });
  const disabledButton = canvas.getByRole('button', {
    name: 'Unavailable account',
  });
  expect(disabledButton).toBeDisabled();
  await userEvent.tab();

  const link = canvas.getByRole('link', { name: 'Account record' });
  expect(link.tagName).toBe('A');
  expect(link).toHaveAttribute('href', '/objects/account');
  await expect(link).toHaveFocus();
  const preventNavigation = (event: Event) => event.preventDefault();
  link.addEventListener('click', preventNavigation);

  try {
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByLabelText('Card link activations')).toHaveTextContent(
        '1',
      ),
    );
    expect(canvas.getByLabelText('Card native target')).toHaveTextContent(
      'link',
    );
  } finally {
    link.removeEventListener('click', preventNavigation);
  }

  await userEvent.click(disabledButton);
  expect(buttonActivations).toHaveTextContent('3');
  expect(errorHandler).not.toHaveBeenCalled();
};
