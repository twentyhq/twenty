import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

type IconWithLabelProps = {
  Icon: IconComponent;
  label: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledSubContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;
const StyledItemLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.size.md};
  leading-trim: both;
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  text-edge: cap;
`;

export const IconWithLabel = ({ Icon, label }: IconWithLabelProps) => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledSubContainer>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <StyledItemLabel>{label}</StyledItemLabel>
      </StyledSubContainer>
    </StyledContainer>
  );
};
