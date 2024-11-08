import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useId } from 'react';
import { CardContent, IconComponent, Toggle } from 'twenty-ui';

type SettingsOptionCardContentProps = {
  Icon?: IconComponent;
  title: React.ReactNode;
  description: string;
  divider?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  cursor: pointer;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledIcon = styled.div`
  align-items: center;
  border: 2px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(8)};
  min-width: ${({ theme }) => theme.icon.size.md};
`;

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

const StyledCover = styled.span`
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

export const SettingsOptionCardContent = ({
  Icon,
  title,
  description,
  divider,
  checked,
  onChange,
}: SettingsOptionCardContentProps) => {
  const theme = useTheme();

  const toggleId = useId();

  return (
    <StyledCardContent divider={divider}>
      {Icon && (
        <StyledIcon>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
        </StyledIcon>
      )}

      <div>
        <StyledTitle>
          <label htmlFor={toggleId}>
            {title}

            <StyledCover />
          </label>
        </StyledTitle>
        <StyledDescription>{description}</StyledDescription>
      </div>

      <StyledToggle id={toggleId} value={checked} onChange={onChange} />
    </StyledCardContent>
  );
};
