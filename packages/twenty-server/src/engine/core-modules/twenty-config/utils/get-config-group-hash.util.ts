import { createHash } from 'crypto';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TypedReflect } from 'src/utils/typed-reflect';

const getConfigVariablesByGroup = (
  group: ConfigVariablesGroup,
): Array<keyof ConfigVariables> => {
  const metadata =
    TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};

  return Object.keys(metadata)
    .filter((key) => metadata[key]?.group === group)
    .map((key) => key as keyof ConfigVariables);
};

export const getConfigGroupHash = (
  twentyConfigService: TwentyConfigService,
  group: ConfigVariablesGroup,
): string => {
  const groupVariables = getConfigVariablesByGroup(group);

  const configValues = groupVariables
    .map((key) => `${key}=${JSON.stringify(twentyConfigService.get(key))}`)
    .sort()
    .join('|');

  return createHash('sha256')
    .update(configValues)
    .digest('hex')
    .substring(0, 16);
};
