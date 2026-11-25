import { type CameraTileText } from 'src/logic-functions/domain/render-camera-tile-text.util';

const ELLIPSIS = '…';

const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

const findLongestFittingLength = async ({
  low,
  high,
  fits,
}: {
  low: number;
  high: number;
  fits: (length: number) => Promise<boolean>;
}): Promise<number> => {
  if (low >= high) {
    return low;
  }

  const middle = Math.ceil((low + high) / 2);

  return (await fits(middle))
    ? findLongestFittingLength({ low: middle, high, fits })
    : findLongestFittingLength({ low, high: middle - 1, fits });
};

export const renderTruncatedCameraTileText = async ({
  text,
  maxWidth,
  render,
}: {
  text: string;
  maxWidth: number;
  render: (content: string) => Promise<CameraTileText>;
}): Promise<CameraTileText> => {
  const characters = Array.from(
    graphemeSegmenter.segment(text.normalize('NFC')),
    ({ segment }) => segment,
  );

  const renderPrefix = (length: number) =>
    render(`${characters.slice(0, length).join('').trimEnd()}${ELLIPSIS}`);

  const fittingLength = await findLongestFittingLength({
    low: 0,
    high: characters.length - 1,
    fits: async (length) => (await renderPrefix(length)).width <= maxWidth,
  });

  return renderPrefix(fittingLength);
};
