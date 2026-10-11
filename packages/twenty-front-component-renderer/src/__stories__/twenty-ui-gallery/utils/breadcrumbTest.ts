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

  await waitFor(() =>
    expect(navigation).toHaveAttribute('data-ref-tag', 'HTML-NAV'),
  );
  await expect(navigation).toHaveAttribute('data-composed-root', 'true');
  await expect(trail.getByRole('list').tagName).toBe('OL');
  await expect(trail.getAllByRole('listitem')).toHaveLength(2);
  await expect(trail.getByText('/')).toHaveAttribute('aria-hidden', 'true');
  await waitFor(() =>
    expect(objects).toHaveAttribute('data-ref-tag', 'HTML-A'),
  );
  await expect(objects).toHaveAttribute('href', '/objects');
  await expect(objects).toHaveAttribute('target', '_self');
  await expect(objects).toHaveAttribute('rel', 'nofollow');
  await expect(objects).toHaveAttribute('download', 'objects.csv');
  await expect(objects).toHaveAttribute('hreflang', 'en');
  await expect(objects).toHaveAttribute('referrerpolicy', 'no-referrer');
  await expect(objects).toHaveAttribute('id', 'objects-link');
  await expect(objects).toHaveClass('native-breadcrumb-link');
  await expect(objects).toHaveAttribute('tabindex', '0');
  await expect(objects).toHaveAttribute('title', 'All objects');
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
        'Activations: 1; Composed activations: 0; Native activations: 1; Native target: HTML-A:/objects',
      ),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        'Activations: 2; Composed activations: 0; Native activations: 2; Native target: HTML-A:/objects',
      ),
    );
    await userEvent.tab();
    await expect(account).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        'Activations: 3; Composed activations: 1; Native activations: 2; Native target: HTML-A:/objects',
      ),
    );
  } finally {
    navigation.removeEventListener('click', preventNavigation);
  }

  const explicitTrail = within(
    canvas.getByRole('navigation', { name: 'Explicit current breadcrumb' }),
  );
  const workspace = explicitTrail.getByRole('link', {
    name: 'Workspace',
    current: 'location',
  });
  const following = explicitTrail.getByRole('link', {
    name: 'Following',
    current: false,
  });

  await expect(workspace).toHaveAttribute('href', '/workspace');
  await expect(workspace).toHaveAttribute('data-composed-route', 'true');
  await expect(following).toHaveAttribute('aria-current', 'false');
  await expect(following).toHaveAttribute('title', '');

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
