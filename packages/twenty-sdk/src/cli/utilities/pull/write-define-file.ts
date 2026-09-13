import {
  type EnumSymbolResolver,
  printTypescriptValue,
} from '@/cli/utilities/pull/print-typescript-value';
import {
  AggregateOperations,
  DateDisplayFormat,
  FieldMetadataType,
  IndexType,
  MetadataWritability,
  NavigationMenuItemType,
  NumberDataType,
  ObjectOpenRecordIn,
  ObjectRecordGroupByDateGranularity,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  RelationOnDeleteAction,
  RelationType,
  ViewCalendarLayout,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewOpenRecordIn,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
  WidgetType,
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

const buildAggregateOperationBinding = (path: string[]): EnumBinding => ({
  path,
  symbol: 'AggregateOperations',
  members: AggregateOperations,
});

export const VIEW_FIELD_ENUM_BINDINGS: EnumBinding[] = [
  buildAggregateOperationBinding(['aggregateOperation']),
];

export const VIEW_ENUM_BINDINGS: EnumBinding[] = [
  { path: ['type'], symbol: 'ViewType', members: ViewType },
  { path: ['visibility'], symbol: 'ViewVisibility', members: ViewVisibility },
  {
    path: ['openRecordIn'],
    symbol: 'ViewOpenRecordIn',
    members: ViewOpenRecordIn,
  },
  buildAggregateOperationBinding(['kanbanAggregateOperation']),
  {
    path: ['calendarLayout'],
    symbol: 'ViewCalendarLayout',
    members: ViewCalendarLayout,
  },
  buildAggregateOperationBinding(['fields', '[]', 'aggregateOperation']),
  {
    path: ['filters', '[]', 'operand'],
    symbol: 'ViewFilterOperand',
    members: ViewFilterOperand,
  },
  {
    path: ['filterGroups', '[]', 'logicalOperator'],
    symbol: 'ViewFilterGroupLogicalOperator',
    members: ViewFilterGroupLogicalOperator,
  },
  {
    path: ['sorts', '[]', 'direction'],
    symbol: 'ViewSortDirection',
    members: ViewSortDirection,
  },
];

const buildPageLayoutWidgetEnumBindings = (prefix: string[]): EnumBinding[] => [
  { path: [...prefix, 'type'], symbol: 'WidgetType', members: WidgetType },
  {
    path: [...prefix, 'position', 'layoutMode'],
    symbol: 'PageLayoutTabLayoutMode',
    members: PageLayoutTabLayoutMode,
  },
  buildAggregateOperationBinding([
    ...prefix,
    'configuration',
    'aggregateOperation',
  ]),
  ...[
    'dateGranularity',
    'primaryAxisDateGranularity',
    'secondaryAxisGroupByDateGranularity',
  ].map((key) => ({
    path: [...prefix, 'configuration', key],
    symbol: 'ObjectRecordGroupByDateGranularity',
    members: ObjectRecordGroupByDateGranularity,
  })),
];

const buildPageLayoutTabEnumBindings = (prefix: string[]): EnumBinding[] => [
  {
    path: [...prefix, 'layoutMode'],
    symbol: 'PageLayoutTabLayoutMode',
    members: PageLayoutTabLayoutMode,
  },
  ...buildPageLayoutWidgetEnumBindings([...prefix, 'widgets', '[]']),
];

export const PAGE_LAYOUT_WIDGET_ENUM_BINDINGS: EnumBinding[] =
  buildPageLayoutWidgetEnumBindings([]);

export const PAGE_LAYOUT_TAB_ENUM_BINDINGS: EnumBinding[] =
  buildPageLayoutTabEnumBindings([]);

export const NAVIGATION_MENU_ITEM_ENUM_BINDINGS: EnumBinding[] = [
  {
    path: ['type'],
    symbol: 'NavigationMenuItemType',
    members: NavigationMenuItemType,
  },
];

export const PAGE_LAYOUT_ENUM_BINDINGS: EnumBinding[] = [
  { path: ['type'], symbol: 'PageLayoutType', members: PageLayoutType },
  ...buildPageLayoutTabEnumBindings(['tabs', '[]']),
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
