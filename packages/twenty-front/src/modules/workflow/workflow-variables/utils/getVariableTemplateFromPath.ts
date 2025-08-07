export const getVariableTemplateFromPath = ({
  stepId,
  path,
}: {
  stepId: string;
  path: string[];
}) => {
  if (path.length === 0) {
    return `{{${stepId}}}`;
  }

  return `{{${stepId}.${path.join('.')}}}`;
};
