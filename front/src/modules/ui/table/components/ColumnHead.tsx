import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';

type OwnProps = {
  viewName: string;
  ViewIcon?: IconComponent;
};

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledIcon = styled.div`
  display: flex;

  & > svg {
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

const StyledText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function ColumnHead({ viewName, ViewIcon }: OwnProps) {
  const theme = useTheme();
  return (
    <StyledTitle>
      <StyledIcon>
        {ViewIcon && <ViewIcon size={theme.icon.size.md} />}
      </StyledIcon>
      <StyledText>{viewName}</StyledText>
    </StyledTitle>
  );
}
