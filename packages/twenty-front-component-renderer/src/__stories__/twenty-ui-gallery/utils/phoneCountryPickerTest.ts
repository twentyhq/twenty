import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const phoneCountryPickerTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);

  await expectFrontComponentMounted(canvas);

  const primary = canvas.getByRole('button', { name: 'Primary phone country' });

  await userEvent.click(primary);

  const dialog = await waitFor(() => {
    expect(errorHandler).not.toHaveBeenCalled();

    return body.getByRole('dialog', {
      name: 'Choose Primary phone country',
    });
  });
  const popup = within(dialog);
  const search = popup.getByRole('searchbox', {
    name: 'Search Primary phone country',
  });

  await waitFor(() => expect(search).toHaveFocus());
  await waitFor(() => expect(dialog).toBeVisible());
  expect(dialog.getBoundingClientRect().width).toBeGreaterThan(200);
  expect(popup.getAllByRole('button')[0]).toHaveTextContent('United States');
  expect(popup.getByRole('button', { name: /United States/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(
    popup.getByRole('button', { name: /United Kingdom/ }),
  ).toHaveTextContent('+44');

  await userEvent.type(search, 'KING');
  expect(
    popup.queryByRole('button', { name: /United States/ }),
  ).not.toBeInTheDocument();
  expect(popup.getByRole('button', { name: /United Kingdom/ })).toBeVisible();
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(primary).toHaveFocus());
  expect(
    canvas.getByRole('status', { name: 'Primary phone country selection' }),
  ).toHaveTextContent('Country: GB; Changes: 1');
  expect(
    canvas.getByRole('status', { name: 'Secondary phone country selection' }),
  ).toHaveTextContent('Country: FR; Changes: 0');

  await userEvent.click(primary);
  const reopenedSearch = await body.findByRole('searchbox', {
    name: 'Search Primary phone country',
  });

  expect(reopenedSearch).toHaveValue('');
  await userEvent.type(reopenedSearch, '+44');
  expect(body.getByText('No countries found')).toHaveAttribute(
    'role',
    'status',
  );
  await userEvent.keyboard('{Enter}');
  expect(body.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(primary).toHaveFocus());

  const secondary = canvas.getByRole('button', {
    name: 'Secondary phone country',
  });

  await userEvent.click(secondary);
  const secondaryDialog = await body.findByRole('dialog', {
    name: 'Choose Secondary phone country',
  });

  expect(within(secondaryDialog).getAllByRole('button')[0]).toHaveTextContent(
    'France',
  );
  await userEvent.click(
    within(secondaryDialog).getByRole('button', { name: /United States/ }),
  );
  await waitFor(() =>
    expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(
    canvas.getByRole('status', { name: 'Secondary phone country selection' }),
  ).toHaveTextContent('Country: US; Changes: 1');
  expect(
    canvas.getByRole('status', { name: 'Primary phone country selection' }),
  ).toHaveTextContent('Country: GB; Changes: 1');
  expect(errorHandler).not.toHaveBeenCalled();
};
