import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

export const isAdminPanelWritableConfigVariable = (
  key: keyof ConfigVariables,
): boolean => {
  const metadata =
    TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};
  const variableMetadata = metadata[key as string];

  return variableMetadata?.group === ConfigVariablesGroup.LLM;
};
