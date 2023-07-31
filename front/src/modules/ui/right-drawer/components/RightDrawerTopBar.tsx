import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ActivityActionBar } from '@/activities/right-drawer/components/ActivityActionBar';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useGetActivityQuery } from '~/generated/graphql';

import { RightDrawerTopBarCloseButton } from './RightDrawerTopBarCloseButton';
import { RightDrawerTopBarExpandButton } from './RightDrawerTopBarExpandButton';

const StyledRightDrawerTopBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 56px;
  justify-content: space-between;
  margin-right: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

const TopBarWrapper = styled.div`
  display: flex;
`;

export function RightDrawerTopBar() {
  const isMobile = useIsMobile();
  const activityId = useRecoilValue(viewableActivityIdState);

  const { data } = useGetActivityQuery({
    variables: {
      activityId: activityId ?? '',
    },
    skip: !activityId,
  });
  const activity = data?.findManyActivities[0];

  return (
    <StyledRightDrawerTopBar>
      <TopBarWrapper>
        <RightDrawerTopBarCloseButton />
        {!isMobile && <RightDrawerTopBarExpandButton />}
      </TopBarWrapper>
      <ActivityActionBar activityId={activity?.id ?? ''} />
    </StyledRightDrawerTopBar>
  );
}
