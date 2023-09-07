import { type ComponentProps, ComponentType, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconChevronLeft } from '@/ui/icon/index';
import NavCollapseButton from '@/ui/navbar/components/NavCollapseButton';
import { navbarIconSize } from '@/ui/navbar/constants';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

export const PAGE_BAR_MIN_HEIGHT = 40;

const StyledTopBarContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.lg};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: 0;
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(1)};
  max-width: 50%;
`;

const StyledTopBarButtonContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledBackIconButton = styled(IconButton)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTopBarIconStyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  padding-left: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledPageActionContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type OwnProps<T> = ComponentProps<'div'> & {
  title: string;
  hasBackButton?: boolean;
  Icon: ComponentType<T>;
  iconProps: T;
  children?: JSX.Element | JSX.Element[];
};

export function PageHeader<T extends Record<string, unknown>>({
  title,
  hasBackButton,
  Icon,
  iconProps,
  children,
  ...props
}: OwnProps<T>) {
  const navigate = useNavigate();
  const navigateBack = useCallback(() => navigate(-1), [navigate]);

  const isNavbarOpened = useRecoilValue(isNavbarOpenedState);

  const iconSize = useIsMobile()
    ? navbarIconSize.mobile
    : navbarIconSize.desktop;

  return (
    <StyledTopBarContainer {...props}>
      <StyledLeftContainer>
        {!isNavbarOpened && (
          <StyledTopBarButtonContainer>
            <NavCollapseButton direction="right" hide={true} />
          </StyledTopBarButtonContainer>
        )}
        {hasBackButton && (
          <StyledTopBarButtonContainer>
            <StyledBackIconButton
              Icon={IconChevronLeft}
              iconSize={iconSize}
              onClick={navigateBack}
              variant="tertiary"
            />
          </StyledTopBarButtonContainer>
        )}
        <StyledTopBarIconStyledTitleContainer>
          {Icon && <Icon {...iconProps} />}
          <StyledTitleContainer data-testid="top-bar-title">
            <OverflowingTextWithTooltip text={title} />
          </StyledTitleContainer>
        </StyledTopBarIconStyledTitleContainer>
      </StyledLeftContainer>
      <StyledPageActionContainer>{children}</StyledPageActionContainer>
    </StyledTopBarContainer>
  );
}
