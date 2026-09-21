export type FakeGraphFailure = {
  status: number;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};
