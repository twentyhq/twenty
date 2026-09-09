// Benchmark publishers, providers and the AI SDK all spell the same model
// differently (`claude-sonnet-4-6`, `claude-sonnet-4.6`, `Claude Sonnet 4.6`),
// so every lookup key goes through this before it is compared.
export const normalizeModelName = (modelName: string): string =>
  modelName
    .toLowerCase()
    .replace(/:batch$/, '')
    .replace(/\(.*\)/g, '')
    .replace(/[\s.\-_/]/g, '');
