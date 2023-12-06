import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/display/icon';
import { SoonPill } from '@/ui/display/pill/components/SoonPill';
import { Tag } from '@/ui/display/tag/components/Tag';
import { ThemeColor } from '@/ui/theme/constants/colors';

const StyledObjectTypeCard = styled.div<SettingsObjectTypeCardProps>`
  ${({ theme, disabled, selected }) => `
    background: ${theme.background.transparent.primary};
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    flex-direction: row;
    font-family: ${theme.font.family};
    font-weight: 500;
    border-style: solid;
    border-width: '1px';
    padding: ${theme.spacing(3)};
    border-radius: ${theme.border.radius.sm};
    gap: ${theme.spacing(2)};
    border-color: ${
      selected ? theme.border.color.inverted : theme.border.color.medium
    };
    color: ${theme.font.color.primary};
    align-items: center;
    width: 140px;
  `}
`;

const StyledTag = styled(Tag)`
  box-sizing: border-box;
  height: ${({ theme }) => theme.spacing(5)};
`;

const StyledIconCheck = styled(IconCheck)`
  margin-left: auto;
`;

const StyledSoonPill = styled(SoonPill)`
  margin-left: auto;
`;

type SettingsObjectTypeCardProps = {
  prefixIcon?: React.ReactNode;
  title: string;
  soon?: boolean;
  disabled?: boolean;
  color: ThemeColor;
  selected: boolean;
  onClick?: () => void;
};

export const SettingsObjectTypeCard = ({
  prefixIcon,
  title,
  soon = false,
  selected,
  disabled = false,
  color,
  onClick,
}: SettingsObjectTypeCardProps) => {
  const theme = useTheme();
  return (
    <StyledObjectTypeCard
      title={title}
      soon={soon}
      disabled={disabled}
      color={color}
      selected={selected}
      onClick={onClick}
    >
      {prefixIcon}
      <StyledTag color={color} text={title} />
      {soon && <StyledSoonPill />}
      {!disabled && selected && <StyledIconCheck size={theme.icon.size.md} />}
    </StyledObjectTypeCard>
  );
};

export {};
