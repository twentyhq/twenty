import { ActivityRichTextEditor } from '@/activities/components/ActivityRichTextEditor';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import styled from '@emotion/styled';
import { lazy, Suspense } from 'react';
import { useRecoilValue } from 'recoil';
import { viewableRichTextComponentState } from '../states/viewableRichTextComponentState';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledContainer = styled.div`
  box-sizing: border-box;
  margin: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(-2)};
  padding-inline: 44px 0px;
  width: 100%;
`;

const StyledLoadingContainer = styled.div`
  height: 200px;
  width: 100%;
`;

export const CommandMenuEditRichTextPage = () => {
  const { activityId, activityObjectNameSingular } = useRecoilValue(
    viewableRichTextComponentState,
  );

  if (
    activityObjectNameSingular !== CoreObjectNameSingular.Note &&
    activityObjectNameSingular !== CoreObjectNameSingular.Task
  ) {
    throw new Error(
      `Invalid activity object name singular: ${activityObjectNameSingular}`,
    );
  }

  return (
    <StyledContainer>
      <Suspense fallback={<StyledLoadingContainer />}>
        <ActivityRichTextEditor
          activityId={activityId}
          activityObjectNameSingular={activityObjectNameSingular}
        />
      </Suspense>
    </StyledContainer>
  );
};
