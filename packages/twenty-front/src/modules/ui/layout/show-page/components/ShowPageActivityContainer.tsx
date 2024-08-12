import { RichTextEditor } from '@/activities/components/RichTextEditor';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import styled from '@emotion/styled';

const StyledShowPageActivityContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
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
      <RichTextEditor
        activityId={targetableObject.id}
        fillTitleFromBody={false}
        activityObjectNameSingular={
          targetableObject.targetObjectNameSingular as
            | CoreObjectNameSingular.Note
            | CoreObjectNameSingular.Task
        }
      />
    </StyledShowPageActivityContainer>
  );
};
