import * as typescript from 'typescript';

import { getUnsupportedFrontComponentImportReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-front-component-import-reason.util';
import { getUnsupportedFrontComponentDefinitionReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-front-component-definition-reason.util';

export const getUnsupportedFrontComponentSourceReason = ({
  source,
  universalIdentifier,
  name,
  description,
  componentName,
  packageNames,
}: {
  source: string;
  universalIdentifier: string;
  name: string;
  description: string | null;
  componentName: string;
  packageNames: ReadonlySet<string>;
}): string | undefined => {
  const sourceFile = typescript.createSourceFile(
    'component.tsx',
    source,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TSX,
  );
  return (
    getUnsupportedFrontComponentImportReason({ sourceFile, packageNames }) ??
    getUnsupportedFrontComponentDefinitionReason({
      sourceFile,
      universalIdentifier,
      name,
      description,
      componentName,
    })
  );
};
