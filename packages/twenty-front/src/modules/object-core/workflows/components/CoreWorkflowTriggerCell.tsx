import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { getCoreWorkflowTriggerDisplay } from '@/object-core/workflows/utils/getCoreWorkflowTriggerDisplay';
import { EllipsisDisplay } from '@/ui/field/display/components/internal/EllipsisDisplay/EllipsisDisplay';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconContainer = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledQualifier = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type CoreWorkflowTriggerCellProps = {
  trigger: CoreWorkflow['trigger'];
};

export const CoreWorkflowTriggerCell = ({
  trigger,
}: CoreWorkflowTriggerCellProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();

  const triggerDisplay = getCoreWorkflowTriggerDisplay(trigger);

  if (!isDefined(triggerDisplay)) {
    return null;
  }

  const TriggerIcon = getIcon(triggerDisplay.iconName);
  const objectLabelPlural = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === triggerDisplay.objectNameSingular,
  )?.labelPlural;

  return (
    <StyledContainer>
      <StyledIconContainer>
        <TriggerIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      </StyledIconContainer>
      <EllipsisDisplay>
        {triggerDisplay.label}
        {isDefined(objectLabelPlural) && (
          <StyledQualifier> · {objectLabelPlural}</StyledQualifier>
        )}
      </EllipsisDisplay>
    </StyledContainer>
  );
};
