const FILE_MODEL_BASE_URL = 'file:///';

export const getSettingsLogicFunctionCodeEditorModelPath = (
  filePath: string,
) => {
  const modelUrl = new URL(FILE_MODEL_BASE_URL);
  modelUrl.pathname = filePath;

  return modelUrl.toString();
};
