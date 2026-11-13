import { isInboxUserMessageCollapsible } from '@/ai/utils/isInboxUserMessageCollapsible';

const LINE_HEIGHT_IN_PX = 24;

describe('isInboxUserMessageCollapsible', () => {
  it('keeps a message of up to 12 lines open', () => {
    expect(
      isInboxUserMessageCollapsible({
        contentHeightInPx: 12 * LINE_HEIGHT_IN_PX,
        lineHeightInPx: LINE_HEIGHT_IN_PX,
      }),
    ).toBe(false);
  });

  it('collapses a message taller than 12 lines', () => {
    expect(
      isInboxUserMessageCollapsible({
        contentHeightInPx: 13 * LINE_HEIGHT_IN_PX,
        lineHeightInPx: LINE_HEIGHT_IN_PX,
      }),
    ).toBe(true);
  });

  it('rounds the extra height of block margins to the nearest line', () => {
    expect(
      isInboxUserMessageCollapsible({
        contentHeightInPx: 12.4 * LINE_HEIGHT_IN_PX,
        lineHeightInPx: LINE_HEIGHT_IN_PX,
      }),
    ).toBe(false);
    expect(
      isInboxUserMessageCollapsible({
        contentHeightInPx: 12.6 * LINE_HEIGHT_IN_PX,
        lineHeightInPx: LINE_HEIGHT_IN_PX,
      }),
    ).toBe(true);
  });

  it('keeps the message open when the line height is unknown', () => {
    expect(
      isInboxUserMessageCollapsible({
        contentHeightInPx: 800,
        lineHeightInPx: Number.NaN,
      }),
    ).toBe(false);
  });
});
