import { isDefined } from 'twenty-shared/utils';

type ToolWithSchema = {
  name: string;
  description?: string;
  inputSchema?: object;
};

type ExtractSharedDefsResult = {
  tools: ToolWithSchema[];
  sharedDefs: Record<string, unknown>;
};

type JsonSchemaWithDefs = {
  $defs?: Record<string, unknown>;
  [key: string]: unknown;
};

export const extractSharedDefs = (
  tools: ToolWithSchema[],
): ExtractSharedDefsResult => {
  const defContentsByName = new Map<string, Set<string>>();
  const defToolCountByName = new Map<string, number>();

  for (const tool of tools) {
    const defs = getDefs(tool.inputSchema);

    if (!isDefined(defs)) {
      continue;
    }

    for (const [defName, defValue] of Object.entries(defs)) {
      const content = JSON.stringify(defValue);
      const contents = defContentsByName.get(defName) ?? new Set<string>();

      contents.add(content);
      defContentsByName.set(defName, contents);
      defToolCountByName.set(
        defName,
        (defToolCountByName.get(defName) ?? 0) + 1,
      );
    }
  }

  const hoistableNames = new Set<string>(
    [...defToolCountByName.entries()]
      .filter(
        ([defName, toolCount]) =>
          toolCount >= 2 && defContentsByName.get(defName)?.size === 1,
      )
      .map(([defName]) => defName),
  );

  if (hoistableNames.size === 0) {
    return { tools, sharedDefs: {} };
  }

  const sharedDefs: Record<string, unknown> = {};
  const dedupedTools = tools.map((tool) => {
    const defs = getDefs(tool.inputSchema);

    if (!isDefined(defs)) {
      return tool;
    }

    const remainingDefs: Record<string, unknown> = {};

    for (const [defName, defValue] of Object.entries(defs)) {
      if (hoistableNames.has(defName)) {
        sharedDefs[defName] = defValue;
      } else {
        remainingDefs[defName] = defValue;
      }
    }

    const schema = tool.inputSchema as JsonSchemaWithDefs;
    const { $defs: _removedDefs, ...schemaWithoutDefs } = schema;

    return {
      ...tool,
      inputSchema:
        Object.keys(remainingDefs).length > 0
          ? { ...schemaWithoutDefs, $defs: remainingDefs }
          : schemaWithoutDefs,
    };
  });

  return { tools: dedupedTools, sharedDefs };
};

const getDefs = (
  inputSchema: object | undefined,
): Record<string, unknown> | undefined => {
  if (!isDefined(inputSchema)) {
    return undefined;
  }

  const defs = (inputSchema as JsonSchemaWithDefs).$defs;

  if (!isDefined(defs) || typeof defs !== 'object') {
    return undefined;
  }

  return defs;
};
