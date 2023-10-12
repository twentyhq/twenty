import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

type IconWithLabelProps = {
  Icon: IconComponent;
  label: string;
};

const StyledContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: 12px;
  padding: var(--spacing-4-px, 4px);
`;

const StyledSubContainer = styled.div`
  align-items: center;
  display: flex;
  gap: var(--spacing-4-px, 4px);
`;
const StyledItemLabel = styled.div`
  color: ${(props) => props.theme.font.color.secondary};
  font-family: Inter;
  font-size: 13px;

  /* Base/Regular */
  font-style: normal;
  font-weight: 400;
  leading-trim: both;
  line-height: 150%;
  text-edge: cap; /* 19.5px */
`;

export const IconWithLabel = ({ Icon, label }: IconWithLabelProps) => {
  return (
    <StyledContainer>
      <StyledSubContainer>
        <Icon size={16} stroke={2} />
        <StyledItemLabel>{label}</StyledItemLabel>
      </StyledSubContainer>
    </StyledContainer>
  );
};
