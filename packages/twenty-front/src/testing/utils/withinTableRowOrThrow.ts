import { within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

export const withinTableRowOrThrow = ({
  canvasElement,
  text,
}: {
  canvasElement: HTMLElement;
  text: string;
}) => {
  const row = within(canvasElement)
    .getByText(text)
    .closest<HTMLElement>('[data-table-row]');

  if (!isDefined(row)) {
    throw new Error(`No table row for ${text}`);
  }

  return within(row);
};
