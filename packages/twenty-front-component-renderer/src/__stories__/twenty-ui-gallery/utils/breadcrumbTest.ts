import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const breadcrumbTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const navigation = canvas.getByRole('navigation', {
    name: 'Account breadcrumb',
  });
  const trail = within(navigation);
  const objects = trail.getByRole('link', { name: 'Objects' });
  const account = trail.getByRole('link', { name: 'Account', current: 'page' });

  await expect(trail.getByRole('list').tagName).toBe('OL');
  await expect(trail.getAllByRole('listitem')).toHaveLength(2);
  await expect(trail.getByText('/')).toHaveAttribute('aria-hidden', 'true');
  await expect(objects).toHaveAttribute('href', '/objects');
  await expect(objects).not.toHaveAttribute('aria-current');
  await expect(account).toHaveAttribute('href', '/objects/account');
  await expect(account.tagName).toBe('A');

  const preventNavigation = (event: Event) => event.preventDefault();
  navigation.addEventListener('click', preventNavigation);

  try {
    await userEvent.click(objects);
    await expect(objects).toHaveFocus();
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        'Activations: 1; Composed activations: 0',
      ),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        'Activations: 2; Composed activations: 0',
      ),
    );
    await userEvent.tab();
    await expect(account).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        'Activations: 3; Composed activations: 1',
      ),
    );
  } finally {
    navigation.removeEventListener('click', preventNavigation);
  }

  const truncatedNavigation = canvas.getByRole('navigation', {
    name: 'Truncated breadcrumb',
  });
  const truncatedTrail = within(truncatedNavigation);
  const currentItem = truncatedTrail.getByText(
    'A long account name that stays available when truncated',
  );

  await expect(currentItem).toHaveAttribute('aria-current', 'page');
  await expect(truncatedTrail.getAllByRole('link')).toHaveLength(1);
  await waitFor(() => {
    expect(getComputedStyle(currentItem).textOverflow).toBe('ellipsis');
    expect(currentItem.scrollWidth).toBeGreaterThan(currentItem.clientWidth);
    expect(truncatedNavigation.scrollWidth).toBeLessThanOrEqual(
      truncatedNavigation.clientWidth,
    );
  });
  await expect(errorHandler).not.toHaveBeenCalled();
};
