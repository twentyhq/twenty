import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/MobileViewport';
import { scrollLeftState } from '@/ui/utilities/scroll/states/scrollLeftComponentState';

import { ColumnDefinition } from '../types/ColumnDefinition';

type ColumnHeadProps = {
  column: ColumnDefinition<FieldMetadata>;
};

const StyledTitle = styled.div<{ hideTitle?: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};

  ${({ hideTitle }) =>
    hideTitle &&
    css`
      @media (max-width: ${MOBILE_VIEWPORT}px) {
        display: none;
      }
    `}
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

export const ColumnHead = ({ column }: ColumnHeadProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const Icon = getIcon(column.iconName);

  const scrollLeft = useRecoilValue(scrollLeftState);

  return (
    <StyledTitle hideTitle={!!column.isLabelIdentifier && scrollLeft > 0}>
      <StyledIcon>
        <Icon size={theme.icon.size.md} />
      </StyledIcon>
      <StyledText>{column.label}</StyledText>
    </StyledTitle>
  );
};
