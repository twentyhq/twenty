import { screen } from '@testing-library/react';

// jsdom does not lay out the page, so ProseMirror cannot place the cursor on click.
export const stubProseMirrorLayout = () => {
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => screen.getByRole('textbox'),
  });
  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    value: () => [],
  });
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(),
  });
};
