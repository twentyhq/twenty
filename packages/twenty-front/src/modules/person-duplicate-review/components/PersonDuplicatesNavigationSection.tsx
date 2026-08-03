import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { Pill } from 'twenty-ui/data-display';

import { usePersonDuplicateGroups } from '@/person-duplicate-review/hooks/usePersonDuplicateGroups';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';

const StyledLink = styled(Link)`
  color: inherit;
  display: block;
  text-decoration: none;
  width: 100%;
`;

export const PersonDuplicatesNavigationSection = () => {
  const { totalCount } = usePersonDuplicateGroups();

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledLink to={AppPath.Duplicates}>
          <NavigationDrawerSectionTitle
            label="Duplicates"
            alwaysShowRightIcon={totalCount > 0}
            rightIcon={
              totalCount > 0 ? (
                <Pill label={totalCount.toString()} />
              ) : undefined
            }
          />
        </StyledLink>
      </NavigationDrawerAnimatedCollapseWrapper>
    </NavigationDrawerSection>
  );
};
