// Benchmark publishers, providers and the AI SDK all spell the same model
// differently (`claude-sonnet-4-6`, `claude-sonnet-4.6`, `Claude Sonnet 4.6`),
// so every lookup key goes through this before it is compared. The trailing
// `-v1:0` strip lets a Bedrock deployment id join the same row as the model it
// serves.
export const normalizeModelName = (modelName: string): string =>
  modelName
    .toLowerCase()
    .replace(/:batch$/, '')
    .replace(/\(.*\)/g, '')
    .replace(/-v\d+(:\d+)?$/, '')
    .replace(/[\s.\-_/]/g, '');
