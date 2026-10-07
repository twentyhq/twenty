import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { removeAutocompleteEmptyAnnouncement } from '@/__stories__/twenty-ui-gallery/utils/removeAutocompleteEmptyAnnouncement';
import { replaceAutocompleteQueryAtWorkerPace } from '@/__stories__/twenty-ui-gallery/utils/replaceAutocompleteQueryAtWorkerPace';
import { showAutocompleteEmptyAnnouncement } from '@/__stories__/twenty-ui-gallery/utils/showAutocompleteEmptyAnnouncement';
import { waitForLiveRegionMarkerReset } from '@/__stories__/twenty-ui-gallery/utils/waitForLiveRegionMarkerReset';

export const autocompleteEmptyTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByRole('combobox', { name: 'Fruit' });
  const autocompleteState = canvas.getByRole('status', {
    name: 'Autocomplete state',
  });
  await replaceAutocompleteQueryAtWorkerPace({
    input,
    autocompleteState,
    query: 'Kiwi',
  });
  const empty = canvas.getByRole('status', { name: 'Matching fruits' });
  await waitFor(() => expect(empty).toHaveTextContent('No matching fruits.'));
  await expect(canvas.queryAllByRole('option')).toHaveLength(0);
  await replaceAutocompleteQueryAtWorkerPace({
    input,
    autocompleteState,
    query: 'Cherry',
  });
  await canvas.findByRole('option', { name: 'Cherry' });
  await expect(empty).toBeEmptyDOMElement();

  const announcement = await showAutocompleteEmptyAnnouncement(canvas);
  await waitFor(() =>
    expect(announcement.textContent).toBe(
      'No matching fruits.Try another search.',
    ),
  );
  await removeAutocompleteEmptyAnnouncement({ canvas, announcement });

  const updatedAnnouncement = await showAutocompleteEmptyAnnouncement(canvas);
  await userEvent.click(
    canvas.getByRole('button', { name: 'Update empty announcement' }),
  );
  await waitFor(() =>
    expect(updatedAnnouncement.textContent).toBe(
      'No matching fruits.Search updated.',
    ),
  );
  await waitForLiveRegionMarkerReset();
  await expect(updatedAnnouncement.textContent).toBe(
    'No matching fruits.Search updated.',
  );
  await removeAutocompleteEmptyAnnouncement({
    canvas,
    announcement: updatedAnnouncement,
  });

  const announcementRemovedBeforeMarkerReset =
    await showAutocompleteEmptyAnnouncement(canvas);
  await removeAutocompleteEmptyAnnouncement({
    canvas,
    announcement: announcementRemovedBeforeMarkerReset,
  });
  await waitForLiveRegionMarkerReset();
  await expect(
    canvas.queryByRole('status', { name: 'Empty announcement' }),
  ).toBeNull();
  await expect(input).toHaveValue('Cherry');
  await expect(errorHandler).not.toHaveBeenCalled();
};
