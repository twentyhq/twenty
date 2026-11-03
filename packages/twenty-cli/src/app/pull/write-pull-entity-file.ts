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
}: {
  entity: Pick<PullEntity, 'kind' | 'definer' | 'config' | 'enumBindings'>;
  relativePath: string;
  isCodeStepPathAvailable?: IsCodeStepPathAvailable;
}): {
  content: string;
  requiredSdkExports: string[];
  codeStepFiles: WorkflowCodeStepFile[];
} => {
  const { config, importStatements, codeStepFiles } =
    entity.kind === 'workflow'
      ? extractWorkflowCodeStepFiles({
          config: entity.config,
          workflowRelativePath: relativePath,
          isCodeStepPathAvailable,
        })
      : { config: entity.config, importStatements: [], codeStepFiles: [] };

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
