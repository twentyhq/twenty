import styled from '@emotion/styled';

import { ThemeColor } from '@/ui/theme/constants/colors';
import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';

const StyledTag = styled.h3<{
  color: ThemeColor;
}>`
  align-items: center;
  background: ${({ color, theme }) => theme.tag.background[color]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ color, theme }) => theme.tag.text[color]};
  display: inline-flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.regular};
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

type TagProps = {
  className?: string;
  color: ThemeColor;
  text: string;
  onClick?: () => void;
};

export const Tag = ({ className, color, text, onClick }: TagProps) => (
  <StyledTag
    className={className}
    color={themeColorSchema.catch('gray').parse(color)}
    onClick={onClick}
  >
    <StyledContent>{text}</StyledContent>
  </StyledTag>
);
