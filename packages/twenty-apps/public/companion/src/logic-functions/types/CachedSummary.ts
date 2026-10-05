export type CachedSummary =
  | {
      status: 'READY';
      markdown: string;
      outcome: 'generated' | 'not-summarizable';
    }
  | { status: 'EMPTY' }
  | { status: 'RUNNING' }
  | { status: 'INTERRUPTED' };
