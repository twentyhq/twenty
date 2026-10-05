import { isDefined } from 'twenty-shared/utils';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const LIVE_REGION_MARKER = '\u2060';
const LIVE_REGION_RESET_WAIT = 250;

export const autocompleteEmptyTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByRole('combobox', { name: 'Fruit' });
  await userEvent.clear(input);
  await userEvent.type(input, 'Kiwi');
  const empty = canvas.getByRole('status', { name: 'Matching fruits' });
  await waitFor(() => expect(empty).toHaveTextContent('No matching fruits.'));
  await expect(canvas.queryAllByRole('option')).toHaveLength(0);
  await userEvent.clear(input);
  await userEvent.type(input, 'Cherry');
  await canvas.findByRole('option', { name: 'Cherry' });
  await expect(empty).toBeEmptyDOMElement();

  const announcementSnapshots: string[] = [];
  const observer = new MutationObserver(() => {
    const announcement = canvas.queryByRole('status', {
      name: 'Empty announcement',
    });

    if (isDefined(announcement)) {
      announcementSnapshots.push(announcement.textContent ?? '');
    }
  });
  observer.observe(canvasElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });

  try {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show empty announcement' }),
    );
    const announcement = await canvas.findByRole('status', {
      name: 'Empty announcement',
    });
    await waitFor(() =>
      expect(announcementSnapshots).toContain(
        `No matching fruits.Try another search.${LIVE_REGION_MARKER}`,
      ),
    );
    await waitFor(() =>
      expect(announcement.textContent).toBe(
        'No matching fruits.Try another search.',
      ),
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove empty announcement' }),
    );
    await waitFor(() => expect(announcement).not.toBeInTheDocument());
    announcementSnapshots.length = 0;
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show empty announcement' }),
    );
    const updatedAnnouncement = await canvas.findByRole('status', {
      name: 'Empty announcement',
    });
    await waitFor(() =>
      expect(announcementSnapshots).toContain(
        `No matching fruits.Try another search.${LIVE_REGION_MARKER}`,
      ),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Update empty announcement' }),
    );
    await waitFor(() =>
      expect(updatedAnnouncement.textContent).toBe(
        'No matching fruits.Search updated.',
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, LIVE_REGION_RESET_WAIT));
    await expect(updatedAnnouncement.textContent).toBe(
      'No matching fruits.Search updated.',
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove empty announcement' }),
    );
    await waitFor(() => expect(updatedAnnouncement).not.toBeInTheDocument());
    announcementSnapshots.length = 0;
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show empty announcement' }),
    );
    const removedAnnouncement = await canvas.findByRole('status', {
      name: 'Empty announcement',
    });
    await waitFor(() =>
      expect(announcementSnapshots).toContain(
        `No matching fruits.Try another search.${LIVE_REGION_MARKER}`,
      ),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove empty announcement' }),
    );
    await waitFor(() => expect(removedAnnouncement).not.toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, LIVE_REGION_RESET_WAIT));
    await expect(
      canvas.queryByRole('status', { name: 'Empty announcement' }),
    ).toBeNull();
    await expect(input).toHaveValue('Cherry');
    await expect(errorHandler).not.toHaveBeenCalled();
  } finally {
    observer.disconnect();
  }
};
