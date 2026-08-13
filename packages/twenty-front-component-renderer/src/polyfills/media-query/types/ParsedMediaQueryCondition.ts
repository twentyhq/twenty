export type ParsedMediaQueryCondition =
  | {
      kind: 'numeric';
      source: 'viewportWidth' | 'viewportHeight' | 'devicePixelRatio';
      comparison: 'min' | 'max' | 'exact';
      value: number;
    }
  | {
      kind: 'color-scheme';
      value: 'light' | 'dark' | 'no-preference';
    };
