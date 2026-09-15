type ImportMissingFirefliesCallsCounts = {
  importedCallCount: number;
  erroredCallCount: number;
  skippedCallCount: number;
};

export type ImportMissingFirefliesCallsResult =
  | (ImportMissingFirefliesCallsCounts & {
      status: 'completed';
    })
  | (ImportMissingFirefliesCallsCounts & {
      status: 'retryable-error';
    });
