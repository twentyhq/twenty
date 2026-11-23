import * as ts from 'typescript';

import { CODE_STEP_FILE_SUFFIX } from '@/app/constants/code-step-file-suffix.constant';

export const DEFINE_ENTITY_KEYS = {
  defineApplication: 'application',
  defineApplicationRole: 'roles',
  defineField: 'fields',
  defineIndex: 'indexes',
  defineLogicFunction: 'logicFunctions',
  definePostInstallLogicFunction: 'logicFunctions',
  definePreInstallLogicFunction: 'logicFunctions',
  defineUninstallLogicFunction: 'logicFunctions',
  defineHealthCheck: 'logicFunctions',
  defineObject: 'objects',
  definePermissionFlag: 'permissionFlags',
  defineRole: 'roles',
  defineSkill: 'skills',
  defineAgent: 'agents',
  defineWorkflow: 'workflows',
  defineConnectionProvider: 'connectionProviders',
  defineMessagingProvider: 'messagingProviders',
  defineMcpServer: 'mcpServers',
  defineFrontComponent: 'frontComponents',
  defineSettingsFrontComponent: 'frontComponents',
  defineView: 'views',
  defineViewField: 'viewFields',
  defineNavigationMenuItem: 'navigationMenuItems',
  definePageLayout: 'pageLayouts',
  definePageLayoutTab: 'pageLayoutTabs',
  definePageLayoutWidget: 'pageLayoutWidgets',
  defineCommandMenuItem: 'commandMenuItems',
  defineTimelineActivityType: 'timelineActivityTypes',
  defineSettingsMenuItem: 'settingsMenuItems',
  defineValidationRule: 'validationRules',
  defineRelatedRecordPath: 'relatedRecordPaths',
} as const;

export type TargetFunction = keyof typeof DEFINE_ENTITY_KEYS;
export type ManifestEntityKey = (typeof DEFINE_ENTITY_KEYS)[TargetFunction];

const isTargetFunction = (name: string): name is TargetFunction =>
  Object.hasOwn(DEFINE_ENTITY_KEYS, name);

export const extractDefineEntity = ({
  fileContent,
  filePath,
}: {
  fileContent: string;
  filePath: string;
}): TargetFunction | undefined => {
  // Workspace-authored workflow code is data, never a local app definition.
  if (filePath.endsWith(CODE_STEP_FILE_SUFFIX)) {
    return undefined;
  }

  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
  );

  for (const node of sourceFile.statements) {
    if (!ts.isExportAssignment(node)) {
      continue;
    }

    if (node.isExportEquals) {
      return undefined;
    }

    const expression = node.expression;

    if (
      ts.isCallExpression(expression) &&
      ts.isIdentifier(expression.expression) &&
      isTargetFunction(expression.expression.text)
    ) {
      return expression.expression.text;
    }
  }

  return undefined;
};
