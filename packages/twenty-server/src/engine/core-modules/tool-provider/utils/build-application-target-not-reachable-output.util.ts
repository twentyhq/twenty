import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolApplicationTarget } from 'src/engine/core-modules/tool-provider/types/tool-application-target.type';

export const buildApplicationTargetNotReachableOutput = ({
  toolName,
  applicationTarget,
}: {
  toolName: string;
  applicationTarget: ToolApplicationTarget;
}): ToolOutput => ({
  success: false,
  message: `Tool "${toolName}" cannot reach this ${applicationTarget.metadataName}`,
  error:
    'An application token can only reach its own application. Do not retry.',
});
