import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';

const StyledPreviewedVersionLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  margin-right: ${themeCssVariables.spacing[1]};
`;

export const CoreWorkflowVersionBreadcrumbSuffixContent = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { previewedWorkflowVersion } = usePreviewWorkflowVersion(workflowId);

  if (!isDefined(previewedWorkflowVersion)) {
    return null;
  }

  return (
    <StyledPreviewedVersionLabel>
      {previewedWorkflowVersion.label}
    </StyledPreviewedVersionLabel>
  );
};
