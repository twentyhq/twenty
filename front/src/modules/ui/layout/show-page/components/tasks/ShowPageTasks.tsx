import styled from '@emotion/styled';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { ShowPageTaskGroups } from './ShowPageTaskGroups';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export function ShowPageTasks({
  entity,
}: {
  entity: ActivityTargetableEntity;
}) {
  return (
    <StyledContainer>
      <RecoilScope SpecificContext={TasksRecoilScopeContext}>
        <ShowPageTaskGroups entity={entity} />
      </RecoilScope>
    </StyledContainer>
  );
}
