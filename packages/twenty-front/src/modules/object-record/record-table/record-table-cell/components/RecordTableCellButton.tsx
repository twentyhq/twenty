import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

import { AnimatedContainer } from '@/object-record/record-table/components/AnimatedContainer';
import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(1)};
`;

type RecordTableCellButtonProps = {
  onClick?: () => void;
  Icon: IconComponent;
};

export const RecordTableCellButton = ({
  onClick,
  Icon,
}: RecordTableCellButtonProps) => (
  <AnimatedContainer>
    <StyledButtonContainer>
      <FloatingIconButton size="small" onClick={onClick} Icon={Icon} />
    </StyledButtonContainer>
  </AnimatedContainer>
);
