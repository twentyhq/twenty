import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItemBreadcrumb } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemBreadcrumb';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

type NavigationDrawerEmptySubItemProps = {
  label: string;
};

const StyledItem = styled('div', {
  shouldForwardProp: (prop) => isPropValid(prop),
})`
  box-sizing: content-box;
  align-items: center;
  background: inherit;
  height: ${({ theme }) => theme.spacing(5)};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) =>
    `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)}`};
  margin-top: 2px;
  width: 100%;
  user-select: none;
`;

const StyledItemElementsContainer = styled.span`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledItemLabel = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNavigationDrawerItemContainer = styled.span`
  display: flex;
  width: 100%;
`;

export const NavigationDrawerEmptySubItem = ({
  label,
}: NavigationDrawerEmptySubItemProps) => {
  const [isNavigationDrawerExpanded] = useRecoilState(
    isNavigationDrawerExpandedState,
  );

  if (!isNavigationDrawerExpanded) {
    return null;
  }

  return (
    <StyledNavigationDrawerItemContainer>
      <StyledItem>
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerItemBreadcrumb
            state={getNavigationSubItemLeftAdornment({
              index: 0,
              arrayLength: 1,
              selectedIndex: 0,
            })}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
        <StyledItemElementsContainer>
          <NavigationDrawerAnimatedCollapseWrapper>
            <StyledItemLabel>{label}</StyledItemLabel>
          </NavigationDrawerAnimatedCollapseWrapper>
        </StyledItemElementsContainer>
      </StyledItem>
    </StyledNavigationDrawerItemContainer>
  );
};
