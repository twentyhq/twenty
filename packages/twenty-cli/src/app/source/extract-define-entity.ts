import * as ts from 'typescript';

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
} as const;

export type TargetFunction = keyof typeof DEFINE_ENTITY_KEYS;
export type ManifestEntityKey = (typeof DEFINE_ENTITY_KEYS)[TargetFunction];

const isTargetFunction = (name: string): name is TargetFunction =>
  Object.hasOwn(DEFINE_ENTITY_KEYS, name);

export const extractDefineEntity = (
  fileContent: string,
): TargetFunction | undefined => {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
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
