// Publishers, providers and the AI SDK spell models differently; stripping `-v1:0` joins Bedrock ids to their model
export const normalizeModelName = (modelName: string): string =>
  modelName
    .toLowerCase()
    .replace(/:batch$/, '')
    .replace(/\(.*\)/g, '')
    .replace(/-v\d+(:\d+)?$/, '')
    .replace(/[\s.\-_/]/g, '');
