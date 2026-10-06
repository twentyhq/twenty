import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const LIVE_REGION_RESET_WAIT = 250;

const replaceQueryAtWorkerPace = async ({
  input,
  autocompleteState,
  query,
}: {
  input: HTMLElement;
  autocompleteState: HTMLElement;
  query: string;
}) => {
  await userEvent.clear(input);
  await waitFor(() =>
    expect(autocompleteState).toHaveTextContent('Query: empty;'),
  );

  for (let typedLength = 1; typedLength <= query.length; typedLength += 1) {
    await userEvent.keyboard(query[typedLength - 1]);
    await waitFor(() =>
      expect(autocompleteState).toHaveTextContent(
        `Query: ${query.slice(0, typedLength)};`,
      ),
    );
  }
};

export const autocompleteEmptyTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const input = canvas.getByRole('combobox', { name: 'Fruit' });
  const autocompleteState = canvas.getByRole('status', {
    name: 'Autocomplete state',
  });
  await replaceQueryAtWorkerPace({ input, autocompleteState, query: 'Kiwi' });
  const empty = canvas.getByRole('status', { name: 'Matching fruits' });
  await waitFor(() => expect(empty).toHaveTextContent('No matching fruits.'));
  await expect(canvas.queryAllByRole('option')).toHaveLength(0);
  await replaceQueryAtWorkerPace({ input, autocompleteState, query: 'Cherry' });
  await canvas.findByRole('option', { name: 'Cherry' });
  await expect(empty).toBeEmptyDOMElement();

  await userEvent.click(
    canvas.getByRole('button', { name: 'Show empty announcement' }),
  );
  const announcement = await canvas.findByRole('status', {
    name: 'Empty announcement',
  });
  await waitFor(() =>
    expect(announcement.textContent).toBe(
      'No matching fruits.Try another search.',
    ),
  );

  await userEvent.click(
    canvas.getByRole('button', { name: 'Remove empty announcement' }),
  );
  await waitFor(() => expect(announcement).not.toBeInTheDocument());
  await userEvent.click(
    canvas.getByRole('button', { name: 'Show empty announcement' }),
  );
  const updatedAnnouncement = await canvas.findByRole('status', {
    name: 'Empty announcement',
  });
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
  await userEvent.click(
    canvas.getByRole('button', { name: 'Show empty announcement' }),
  );
  const removedAnnouncement = await canvas.findByRole('status', {
    name: 'Empty announcement',
  });
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
};
