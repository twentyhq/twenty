import React from 'react';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent } from 'twenty-ui';

import { ThemeColor } from '@/ui/theme/constants/MainColorNames';
import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';

const StyledTag = styled.h3<{
  color: ThemeColor;
  weight: TagWeight;
  shrink?: number;
  visibility?: string;
}>`
  align-items: center;
  background: ${({ color, theme }) => theme.tag.background[color]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ color, theme }) => theme.tag.text[color]};
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
  flex-shrink: ${({ shrink }) => shrink || 0};
  visibility: ${({ visibility }) => visibility};
  display: inline-flex;
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
  shrink?: number;
  visibility?: number;
  set: React.Dispatch<React.SetStateAction<Set<number>>>;
  id: number;
  rootRef?: React.RefObject<HTMLElement>;
};

export const Tag = ({
  className,
  color,
  text,
  Icon,
  onClick,
  weight = 'regular',
  shrink = 0,
  set,
  id,
  rootRef,
}: TagProps) => {
  const theme = useTheme();
  const { ref } = useInView({
    threshold: 1,
    onChange: (inView, entry) => {
      if (inView || (!inView && entry.intersectionRatio > 0.2)) {
        set((prev: Set<number>) => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      } else {
        set((prev: Set<number>) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    root: rootRef?.current,
    rootMargin: '0px 0px -50px 0px',
    delay: 10000,
  });

  return (
    <StyledTag
      className={className}
      color={themeColorSchema.catch('gray').parse(color)}
      onClick={onClick}
      weight={weight}
      shrink={shrink}
      ref={ref}
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
