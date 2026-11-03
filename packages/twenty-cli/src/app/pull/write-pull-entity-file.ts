import { type PullEntity } from '@/app/pull/build-pull-entities';
import {
  extractWorkflowCodeStepFiles,
  type IsCodeStepPathAvailable,
  type WorkflowCodeStepFile,
} from '@/app/pull/extract-workflow-code-step-files';
import { writeDefineFile } from '@/app/pull/write-define-file';

export const writePullEntityFile = ({
  entity,
  relativePath,
  isCodeStepPathAvailable,
  localCodeStepPathByStepIdentifier,
}: {
  entity: Pick<PullEntity, 'kind' | 'definer' | 'config' | 'enumBindings'>;
  relativePath: string;
  isCodeStepPathAvailable?: IsCodeStepPathAvailable;
  localCodeStepPathByStepIdentifier?: ReadonlyMap<string, string>;
}): {
  content: string;
  requiredSdkExports: string[];
  codeStepFiles: WorkflowCodeStepFile[];
} => {
  if (entity.kind !== 'workflow') {
    return {
      ...writeDefineFile({
        definer: entity.definer,
        config: entity.config,
        enumBindings: entity.enumBindings,
      }),
      codeStepFiles: [],
    };
  }

  const { config, importStatements, codeStepFiles } =
    extractWorkflowCodeStepFiles({
      config: entity.config,
      workflowRelativePath: relativePath,
      isCodeStepPathAvailable,
      localCodeStepPathByStepIdentifier,
    });

  return {
    ...writeDefineFile({
      definer: entity.definer,
      config,
      enumBindings: entity.enumBindings,
      importStatements,
    }),
    codeStepFiles,
  };
};
