import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';

const StyledTag = styled.h3<{
  color: ThemeColor;
  weight: TagWeight;
}>`
  align-items: center;
  background: ${({ color, theme }) => theme.tag.background[color]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ color, theme }) => theme.tag.text[color]};
  display: inline-flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme, weight }) =>
    weight === 'regular'
      ? theme.font.weight.regular
      : theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(5)};
  margin: 0;
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledContent = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIconContainer = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

type TagWeight = 'regular' | 'medium';

type TagProps = {
  className?: string;
  color: ThemeColor;
  text: string;
  Icon?: IconComponent;
  onClick?: () => void;
  weight?: TagWeight;
};

export const Tag = ({
  className,
  color,
  text,
  Icon,
  onClick,
  weight = 'regular',
}: TagProps) => {
  const theme = useTheme();
  return (
    <StyledTag
      className={className}
      color={themeColorSchema.catch('gray').parse(color)}
      onClick={onClick}
      weight={weight}
    >
      {!!Icon && (
        <StyledIconContainer>
          <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledIconContainer>
      )}
      <StyledContent>{text}</StyledContent>
    </StyledTag>
  );
};
