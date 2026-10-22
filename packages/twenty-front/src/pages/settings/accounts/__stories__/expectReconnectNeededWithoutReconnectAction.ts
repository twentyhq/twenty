import { expect, userEvent, within } from 'storybook/test';

import { withinTableRowOrThrow } from '~/testing/utils/withinTableRowOrThrow';

export const expectReconnectNeededWithoutReconnectAction = async ({
  canvasElement,
  handle,
  applicationName,
}: {
  canvasElement: HTMLElement;
  handle: string;
  applicationName: string;
}) => {
  const accountRow = withinTableRowOrThrow({ canvasElement, text: handle });

  expect(accountRow.getByText('Reconnect needed')).toBeVisible();
  expect(
    withinTableRowOrThrow({ canvasElement, text: applicationName }).getByText(
      'Reconnect needed',
    ),
  ).toBeVisible();

  await userEvent.click(
    accountRow.getByRole('button', { name: 'More options' }),
  );

  const body = within(canvasElement.ownerDocument.body);

  expect(
    await body.findByRole('menuitem', {
      name: 'Delete account and synced data',
    }),
  ).toBeVisible();
  expect(
    body.queryByRole('menuitem', { name: /Reconnect/ }),
  ).not.toBeInTheDocument();
};
