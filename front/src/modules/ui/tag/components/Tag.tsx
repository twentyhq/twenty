import styled from '@emotion/styled';

import { ThemeColor } from '@/ui/theme/constants/colors';

const tagColors = [
  'green',
  'turquoise',
  'sky',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'gray',
];

export type TagColor = (typeof tagColors)[number];

export const castToTagColor = (color: string): TagColor =>
  tagColors.find((tagColor) => tagColor === color) ?? 'gray';

const StyledTag = styled.h3<{
  color: TagColor;
}>`
  align-items: center;
  background: ${({ color, theme }) => theme.tag.background[color]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ color, theme }) => theme.tag.text[color]};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  margin: 0;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

export type TagProps = {
  color: ThemeColor;
  text: string;
  onClick?: () => void;
};

export const Tag = ({ color, text, onClick }: TagProps) => (
  <StyledTag color={castToTagColor(color)} onClick={onClick}>
    {text}
  </StyledTag>
);
