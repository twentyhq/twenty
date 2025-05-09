import { ActivityRichTextEditor } from '@/activities/components/ActivityRichTextEditor';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { viewableRichTextComponentState } from '../states/viewableRichTextComponentState';

const StyledContainer = styled.div`
  box-sizing: border-box;
  margin: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(-2)};
  padding-inline: 44px 0px;
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
      <ActivityRichTextEditor
        activityId={activityId}
        activityObjectNameSingular={activityObjectNameSingular}
      />
    </StyledContainer>
  );
};
