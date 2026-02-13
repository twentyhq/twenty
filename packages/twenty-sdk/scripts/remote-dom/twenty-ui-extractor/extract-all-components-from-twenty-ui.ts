import * as path from 'path';
import { type ExportSpecifier, Project } from 'ts-morph';
import { isDefined, pascalToKebab } from 'twenty-shared/utils';

import { type PropertySchema } from '@/front-component-renderer/types/PropertySchema';

import {
  logCategory,
  logCountInline,
  logDimText,
  logEmpty,
  logLine,
  logWarning,
} from '../utils/logger';
import {
  TWENTY_UI_COMPONENT_CATEGORIES_TO_SCAN,
  TWENTY_UI_ROOT_PATH,
} from './constants';
import { classifyComponentPropsForRemoteDomGeneration } from './utils/classify-component-props-for-remote-dom-generation';
import { doesComponentSupportRefForwarding } from './utils/does-component-support-ref-forwarding';
import { getTwentyUiComponentCategoryIndexPath } from './utils/get-twenty-ui-component-category-index-path';
import { isReactComponentExport } from './utils/is-react-component-export';
import { logDiscoveredComponents } from './utils/log-discovered-components';
import { shouldSkipExport } from './utils/should-skip-export';

export type DiscoveredComponent = {
  tag: string;
  name: string;
  properties: Record<string, PropertySchema>;
  events: string[];
  slots: string[];
  supportsRefForwarding: boolean;
  componentImport: string;
  componentPath: string;
  propsTypeName: string;
};

const extractComponentsFromCategory = (
  project: Project,
  category: string,
): DiscoveredComponent[] => {
  const indexPath = getTwentyUiComponentCategoryIndexPath(category);
  const sourceFile = project.getSourceFile(indexPath);

  if (!isDefined(sourceFile)) {
    logWarning(`Could not find barrel file at ${indexPath}`);

    return [];
  }

  const allNamedExports = sourceFile
    .getExportDeclarations()
    .flatMap((declaration) => declaration.getNamedExports());

  const propsTypeExportsByName = new Map<string, ExportSpecifier>();
  const componentExports: ExportSpecifier[] = [];

  for (const namedExport of allNamedExports) {
    if (namedExport.getName().endsWith('Props')) {
      propsTypeExportsByName.set(namedExport.getName(), namedExport);
      continue;
    }

    if (!isReactComponentExport(namedExport)) {
      continue;
    }

    componentExports.push(namedExport);
  }

  const discoveredComponents: DiscoveredComponent[] = [];

  for (const namedExport of componentExports) {
    const exportName = namedExport.getName();

    if (shouldSkipExport(exportName)) {
      continue;
    }

    const expectedPropsTypeName = `${exportName}Props`;
    const propsTypeExport = propsTypeExportsByName.get(expectedPropsTypeName);

    if (!isDefined(propsTypeExport)) {
      continue;
    }

    const propsType = propsTypeExport.getNameNode().getType();

    const { properties, events, slots } =
      classifyComponentPropsForRemoteDomGeneration(propsType);

    const supportsRefForwarding =
      doesComponentSupportRefForwarding(namedExport);
    const kebabName = pascalToKebab(exportName);

    discoveredComponents.push({
      tag: `twenty-ui-${kebabName}`,
      name: `TwentyUi${exportName}`,
      properties,
      events,
      slots,
      supportsRefForwarding,
      componentImport: exportName,
      componentPath: `twenty-ui/${category}`,
      propsTypeName: expectedPropsTypeName,
    });
  }

  return discoveredComponents;
};

export const extractAllComponentsFromTwentyUi = (): DiscoveredComponent[] => {
  logDimText('  Loading twenty-ui TypeScript project...');

  const project = new Project({
    tsConfigFilePath: path.join(TWENTY_UI_ROOT_PATH, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  });

  logLine(
    '  ' +
      logCountInline(
        project.getSourceFiles().length,
        'source file loaded from twenty-ui',
        'source files loaded from twenty-ui',
      ),
  );
  logEmpty();

  const allDiscoveredComponents: DiscoveredComponent[] = [];

  for (const [
    index,
    category,
  ] of TWENTY_UI_COMPONENT_CATEGORIES_TO_SCAN.entries()) {
    if (index > 0) {
      logEmpty();
    }

    logCategory(category);

    const discoveredComponents = extractComponentsFromCategory(
      project,
      category,
    );

    logDiscoveredComponents(discoveredComponents);

    allDiscoveredComponents.push(...discoveredComponents);
  }

  return allDiscoveredComponents;
};
