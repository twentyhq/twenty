import { RichTextEditor } from '@/activities/components/RichTextEditor';
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
      <RichTextEditor
        activityId={targetableObject.id}
        fillTitleFromBody={false}
        objectNameSingular={targetableObject.targetObjectNameSingular}
      />
    </StyledShowPageActivityContainer>
  );
};
