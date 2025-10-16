export const COVERED_APPLICATION_FOLDERS = {
  'hello-world': {
    path: 'hello-world',
  },
} as const satisfies Record<string, { path: string }>;
