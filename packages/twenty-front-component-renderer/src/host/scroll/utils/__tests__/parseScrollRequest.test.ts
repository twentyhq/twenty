import { SCROLL_INTO_VIEW_ALIGNMENTS } from '@/constants/ScrollIntoViewAlignments';
import { parseScrollRequest } from '@/host/scroll/utils/parseScrollRequest';

describe('parseScrollRequest', () => {
  it.each([
    { request: undefined },
    { request: null },
    { request: 'scrollTo' },
    { request: 10 },
    { request: [{ method: 'scrollTo', top: 10 }] },
  ])(
    'should return null when the request $request is not a plain object',
    ({ request }) => {
      expect(parseScrollRequest(request)).toBeNull();
    },
  );

  it('should keep both finite axes of a scrollTo request', () => {
    expect(
      parseScrollRequest({ method: 'scrollTo', top: 40, left: -12.5 }),
    ).toStrictEqual({ method: 'scrollTo', top: 40, left: -12.5 });
  });

  it('should keep only the top axis of a scrollTo request that only sets top', () => {
    expect(parseScrollRequest({ method: 'scrollTo', top: 0 })).toStrictEqual({
      method: 'scrollTo',
      top: 0,
    });
  });

  it('should keep only the left axis of a scrollTo request that only sets left', () => {
    expect(parseScrollRequest({ method: 'scrollTo', left: 25 })).toStrictEqual({
      method: 'scrollTo',
      left: 25,
    });
  });

  it.each([
    { top: Number.NaN },
    { top: Number.POSITIVE_INFINITY },
    { top: Number.NEGATIVE_INFINITY },
    { top: '40' },
    { top: null },
  ])(
    'should drop the top axis $top of a scrollTo request and keep the finite left axis',
    ({ top }) => {
      expect(
        parseScrollRequest({ method: 'scrollTo', top, left: 8 }),
      ).toStrictEqual({ method: 'scrollTo', left: 8 });
    },
  );

  it.each([
    { request: { method: 'scrollTo' } },
    { request: { method: 'scrollTo', top: Number.NaN, left: '8' } },
    {
      request: {
        method: 'scrollTo',
        top: Number.POSITIVE_INFINITY,
        left: undefined,
      },
    },
  ])(
    'should return null for the scrollTo request $request without a finite axis',
    ({ request }) => {
      expect(parseScrollRequest(request)).toBeNull();
    },
  );

  it('should drop the unknown properties of a scrollTo request', () => {
    expect(
      parseScrollRequest({ method: 'scrollTo', top: 10, behavior: 'smooth' }),
    ).toStrictEqual({ method: 'scrollTo', top: 10 });
  });

  it.each(
    SCROLL_INTO_VIEW_ALIGNMENTS.flatMap((block) =>
      SCROLL_INTO_VIEW_ALIGNMENTS.map((inline) => ({ block, inline })),
    ),
  )(
    'should keep a scrollIntoView request aligned with block $block and inline $inline',
    ({ block, inline }) => {
      expect(
        parseScrollRequest({ method: 'scrollIntoView', block, inline }),
      ).toStrictEqual({ method: 'scrollIntoView', block, inline });
    },
  );

  it('should drop the unknown properties of a scrollIntoView request', () => {
    expect(
      parseScrollRequest({
        method: 'scrollIntoView',
        block: 'center',
        inline: 'nearest',
        behavior: 'smooth',
      }),
    ).toStrictEqual({
      method: 'scrollIntoView',
      block: 'center',
      inline: 'nearest',
    });
  });

  it.each([
    { block: 'middle', inline: 'nearest' },
    { block: 'start', inline: 'left' },
    { block: 'START', inline: 'nearest' },
    { block: undefined, inline: 'nearest' },
    { block: 'start', inline: undefined },
    { block: 0, inline: 'nearest' },
  ])(
    'should return null for a scrollIntoView request with block $block and inline $inline',
    ({ block, inline }) => {
      expect(
        parseScrollRequest({ method: 'scrollIntoView', block, inline }),
      ).toBeNull();
    },
  );

  it.each([
    { request: { method: 'scrollBy', top: 10 } },
    { request: { method: 'scroll', top: 10 } },
    { request: { top: 10, left: 10 } },
    { request: { method: 'SCROLLTO', top: 10 } },
  ])(
    'should return null for the request $request with an unknown method',
    ({ request }) => {
      expect(parseScrollRequest(request)).toBeNull();
    },
  );
});
