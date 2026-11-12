import * as typescript from 'typescript';

import { getUnsupportedFrontComponentDefinitionReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-front-component-definition-reason.util';

export const getUnsupportedFrontComponentSourceReason = ({
  source,
  universalIdentifier,
  name,
  description,
  componentName,
}: {
  source: string;
  universalIdentifier: string;
  name: string;
  description: string | null;
  componentName: string;
}): string | undefined => {
  const sourceFile = typescript.createSourceFile(
    'component.tsx',
    source,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TSX,
  );
  return getUnsupportedFrontComponentDefinitionReason({
    sourceFile,
    universalIdentifier,
    name,
    description,
    componentName,
  });
};
