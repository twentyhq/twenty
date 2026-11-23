import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRelationWithUnloadedRecordCount = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  width: 100%;
`;

const StyledUnloadedRecordCountChip = styled(Chip)`
  flex-shrink: 0;
`;

type RelationWithUnloadedRecordCountProps = {
  unloadedRecordCount: number;
  children: ReactNode;
};

export const RelationWithUnloadedRecordCount = ({
  unloadedRecordCount,
  children,
}: RelationWithUnloadedRecordCountProps) => {
  if (unloadedRecordCount <= 0) {
    return children;
  }

  return (
    <StyledRelationWithUnloadedRecordCount>
      {children}
      <StyledUnloadedRecordCountChip
        variant="soft"
        tooltipContent={plural(unloadedRecordCount, {
          one: '# more related record',
          other: '# more related records',
        })}
        tooltipPlace="top"
        alwaysShowTooltip
      >
        {`+${unloadedRecordCount}`}
      </StyledUnloadedRecordCountChip>
    </StyledRelationWithUnloadedRecordCount>
  );
};
