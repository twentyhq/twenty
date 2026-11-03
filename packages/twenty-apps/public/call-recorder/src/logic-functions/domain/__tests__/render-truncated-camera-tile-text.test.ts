import { describe, expect, it } from 'vitest';

import { renderTruncatedCameraTileText } from 'src/logic-functions/domain/render-truncated-camera-tile-text.util';

const CHARACTER_WIDTH = 10;

const renderMonospace = async (content: string) => ({
  input: Buffer.from(content),
  width: Array.from(content).length * CHARACTER_WIDTH,
  height: 20,
});

const truncate = async ({
  text,
  maxWidth,
}: {
  text: string;
  maxWidth: number;
}) =>
  (
    await renderTruncatedCameraTileText({
      text,
      maxWidth,
      render: renderMonospace,
    })
  ).input.toString();

describe('renderTruncatedCameraTileText', () => {
  it('keeps the longest prefix that fits with the ellipsis', async () => {
    expect(await truncate({ text: 'Acme International', maxWidth: 70 })).toBe(
      'Acme I…',
    );
  });

  it('drops trailing spaces before the ellipsis', async () => {
    expect(await truncate({ text: 'Acme International', maxWidth: 50 })).toBe(
      'Acme…',
    );
  });

  it('keeps accented characters whole', async () => {
    expect(await truncate({ text: 'Café Société', maxWidth: 50 })).toBe(
      'Café…',
    );
  });

  it('falls back to the ellipsis alone when nothing else fits', async () => {
    expect(await truncate({ text: 'Acme', maxWidth: 5 })).toBe('…');
  });
});
