import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import styled from '@emotion/styled';

const StyledShowPageActivityContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;
export const ShowPageActivityContainer = ({
  targetableObject,
}: {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
}) => {
  return (
    <StyledShowPageActivityContainer>
      <ActivityBodyEditor
        activityId={targetableObject.id}
        fillTitleFromBody={false}
      />
    </StyledShowPageActivityContainer>
  );
};
