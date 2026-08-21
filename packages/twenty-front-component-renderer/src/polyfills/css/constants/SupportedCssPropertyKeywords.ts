// Every entry must be supported by all engines Twenty targets, not merely
// specified: an optimistic answer here is worse than the conservative false
// this table returns for everything it omits.
export const SUPPORTED_CSS_PROPERTY_KEYWORDS = new Map<
  string,
  readonly string[]
>([
  ['box-sizing', ['border-box', 'content-box']],
  ['container-type', ['inline-size', 'normal', 'size']],
  [
    'display',
    [
      'block',
      'contents',
      'flex',
      'flow-root',
      'grid',
      'inline',
      'inline-block',
      'inline-flex',
      'inline-grid',
      'none',
    ],
  ],
  ['flex-direction', ['column', 'column-reverse', 'row', 'row-reverse']],
  ['flex-wrap', ['nowrap', 'wrap', 'wrap-reverse']],
  ['object-fit', ['contain', 'cover', 'fill', 'none', 'scale-down']],
  ['overscroll-behavior', ['auto', 'contain', 'none']],
  ['pointer-events', ['auto', 'none']],
  ['position', ['absolute', 'fixed', 'relative', 'static', 'sticky']],
  ['scroll-behavior', ['auto', 'smooth']],
  ['text-overflow', ['clip', 'ellipsis']],
  ['touch-action', ['auto', 'manipulation', 'none', 'pan-x', 'pan-y']],
  ['user-select', ['auto', 'none', 'text']],
  ['visibility', ['collapse', 'hidden', 'visible']],
  [
    'white-space',
    ['break-spaces', 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap'],
  ],
]);
