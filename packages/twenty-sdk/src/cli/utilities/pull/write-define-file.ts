import {
  type EnumSymbolResolver,
  printTypescriptValue,
} from '@/cli/utilities/pull/print-typescript-value';
import {
  DateDisplayFormat,
  FieldMetadataType,
  IndexType,
  MetadataWritability,
  NumberDataType,
  ObjectOpenRecordIn,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const MAX_IMPORT_LINE_LENGTH = 80;

export type EnumBinding = {
  path: string[];
  symbol: string;
  members: Record<string, string>;
};

const buildFieldEnumBindings = (prefix: string[]): EnumBinding[] => [
  {
    path: [...prefix, 'type'],
    symbol: 'FieldType',
    members: FieldMetadataType,
  },
  {
    path: [...prefix, 'writability'],
    symbol: 'MetadataWritability',
    members: MetadataWritability,
  },
  {
    path: [...prefix, 'universalSettings', 'relationType'],
    symbol: 'RelationType',
    members: RelationType,
  },
  {
    path: [...prefix, 'universalSettings', 'onDelete'],
    symbol: 'OnDeleteAction',
    members: RelationOnDeleteAction,
  },
  {
    path: [...prefix, 'universalSettings', 'dataType'],
    symbol: 'NumberDataType',
    members: NumberDataType,
  },
  {
    path: [...prefix, 'universalSettings', 'displayFormat'],
    symbol: 'DateDisplayFormat',
    members: DateDisplayFormat,
  },
];

export const FIELD_ENUM_BINDINGS: EnumBinding[] = buildFieldEnumBindings([]);

export const OBJECT_ENUM_BINDINGS: EnumBinding[] = [
  {
    path: ['writability'],
    symbol: 'MetadataWritability',
    members: MetadataWritability,
  },
  {
    path: ['openRecordIn'],
    symbol: 'ObjectOpenRecordIn',
    members: ObjectOpenRecordIn,
  },
  ...buildFieldEnumBindings(['fields', '[]']),
];

export const INDEX_ENUM_BINDINGS: EnumBinding[] = [
  { path: ['indexType'], symbol: 'IndexType', members: IndexType },
];

const isSamePath = (left: string[], right: string[]): boolean =>
  left.length === right.length &&
  left.every((segment, index) => segment === right[index]);

export const writeDefineFile = ({
  definer,
  config,
  enumBindings = [],
}: {
  definer: string;
  config: unknown;
  enumBindings?: EnumBinding[];
}): string => {
  const usedSymbols = new Set<string>();

  const resolveEnumSymbol: EnumSymbolResolver = ({ path, value }) => {
    const binding = enumBindings.find((candidate) =>
      isSamePath(candidate.path, path),
    );

    if (!isDefined(binding)) {
      return undefined;
    }

    const memberName = Object.keys(binding.members).find(
      (key) => binding.members[key] === value,
    );

    if (!isDefined(memberName)) {
      return undefined;
    }

    usedSymbols.add(binding.symbol);

    return `${binding.symbol}.${memberName}`;
  };

  const body = printTypescriptValue({ value: config, resolveEnumSymbol });
  const imported = [definer, ...[...usedSymbols].sort()];
  const singleLineImport = `import { ${imported.join(', ')} } from 'twenty-sdk/define';`;
  const importStatement =
    singleLineImport.length <= MAX_IMPORT_LINE_LENGTH
      ? singleLineImport
      : `import {\n${imported.map((name) => `  ${name},`).join('\n')}\n} from 'twenty-sdk/define';`;

  return `${importStatement}

export default ${definer}(${body});
`;
};
