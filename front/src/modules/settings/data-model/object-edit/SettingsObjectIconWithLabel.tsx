import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

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
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

type SettingsObjectIconWithLabelProps = {
  Icon?: IconComponent;
  label: string;
};

export const SettingsObjectIconWithLabel = ({
  Icon,
  label,
}: SettingsObjectIconWithLabelProps) => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledSubContainer>
        {!!Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        <StyledItemLabel>{label}</StyledItemLabel>
      </StyledSubContainer>
    </StyledContainer>
  );
};
