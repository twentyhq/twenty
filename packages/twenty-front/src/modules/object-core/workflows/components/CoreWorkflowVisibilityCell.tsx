import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type WorkflowVisibility } from '~/generated/graphql';
import { CORE_WORKFLOW_VISIBILITY_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowVisibilityOptions';

const StyledVisibility = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

type CoreWorkflowVisibilityCellProps = {
  visibility: WorkflowVisibility;
};

export const CoreWorkflowVisibilityCell = ({
  visibility,
}: CoreWorkflowVisibilityCellProps) => {
  const theme = useTheme();

  const visibilityOption = CORE_WORKFLOW_VISIBILITY_OPTIONS.find(
    ({ value }) => value === visibility,
  );

  if (!isDefined(visibilityOption)) {
    return null;
  }

  return (
    <StyledVisibility>
      <visibilityOption.Icon
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.sm}
      />
      <OverflowingTextWithTooltip text={t(visibilityOption.label)} />
    </StyledVisibility>
  );
};
