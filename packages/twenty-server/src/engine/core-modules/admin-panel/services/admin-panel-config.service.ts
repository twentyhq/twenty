import { Injectable } from '@nestjs/common';

import { type ConfigVariableDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { type ConfigVariablesGroupDataDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables-group.dto';
import { type ConfigVariablesDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables.dto';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_GROUP_METADATA } from 'src/engine/core-modules/twenty-config/constants/config-variables-group-metadata';
import { type ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AdminPanelConfigService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getConfigVariablesGrouped(): ConfigVariablesDTO {
    const rawEnvVars = this.twentyConfigService.getAll();
    const groupedData = new Map<ConfigVariablesGroup, ConfigVariableDTO[]>();

    for (const [varName, { value, metadata, source }] of Object.entries(
      rawEnvVars,
    )) {
      const { group, description } = metadata;

      if (metadata.isHiddenInAdminPanel) {
        continue;
      }

      const envVar: ConfigVariableDTO = {
        name: varName,
        description,
        value: value ?? null,
        isSensitive: metadata.isSensitive ?? false,
        isEnvOnly: metadata.isEnvOnly ?? false,
        type: metadata.type,
        options: metadata.options,
        source,
      };

      if (!groupedData.has(group)) {
        groupedData.set(group, []);
      }

      groupedData.get(group)?.push(envVar);
    }

    const groups: ConfigVariablesGroupDataDTO[] = Array.from(
      groupedData.entries(),
    )
      .filter(
        ([name]) => !CONFIG_VARIABLES_GROUP_METADATA[name].isHiddenInAdminPanel,
      )
      .sort((a, b) => {
        const positionA = CONFIG_VARIABLES_GROUP_METADATA[a[0]].position;
        const positionB = CONFIG_VARIABLES_GROUP_METADATA[b[0]].position;

        return positionA - positionB;
      })
      .map(([name, variables]) => ({
        name,
        description: CONFIG_VARIABLES_GROUP_METADATA[name].description,
        isHiddenOnLoad: CONFIG_VARIABLES_GROUP_METADATA[name].isHiddenOnLoad,
        variables: variables.sort((a, b) => a.name.localeCompare(b.name)),
      }));

    return { groups };
  }

  getConfigVariable(key: string): ConfigVariableDTO {
    const variableWithMetadata =
      this.twentyConfigService.getVariableWithMetadata(
        key as keyof ConfigVariables,
      );

    if (!variableWithMetadata) {
      throw new Error(`Config variable ${key} not found`);
    }

    const { value, metadata, source } = variableWithMetadata;

    return {
      name: key,
      description: metadata.description ?? '',
      value: value ?? null,
      isSensitive: metadata.isSensitive ?? false,
      isEnvOnly: metadata.isEnvOnly ?? false,
      type: metadata.type,
      options: metadata.options,
      source,
    };
  }
}
