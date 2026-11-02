import { within } from 'storybook/test';

export const getSettingsApplicationsTableRowLinks = (
  canvasElement: HTMLElement,
) =>
  within(canvasElement)
    .queryAllByRole('link')
    .map((link) => link.getAttribute('href'));
