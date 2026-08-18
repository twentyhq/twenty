import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { IconTrash } from 'twenty-ui/icon';
import { IconButtonGroup } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDeleteButtonContainer = styled.div<{ shouldDisplay: boolean }>`
  left: 100%;
  opacity: ${({ shouldDisplay }) => (shouldDisplay ? 1 : 0)};
  padding-left: ${themeCssVariables.spacing[2]};
  pointer-events: ${({ shouldDisplay }) => (shouldDisplay ? 'all' : 'none')};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`;

type WorkflowNodeDeleteButtonProps = {
  shouldDisplay: boolean;
  onDelete: () => void;
};

export const WorkflowNodeDeleteButton = ({
  shouldDisplay,
  onDelete,
}: WorkflowNodeDeleteButtonProps) => {
  const { t } = useLingui();

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();

    onDelete();
  };

  return (
    <StyledDeleteButtonContainer shouldDisplay={shouldDisplay}>
      <IconButtonGroup
        className="nodrag nopan"
        iconButtons={[
          {
            Icon: IconTrash,
            ariaLabel: t`Delete node`,
            onClick: handleClick,
          },
        ]}
      />
    </StyledDeleteButtonContainer>
  );
};
