import { RichTextEditor } from '@/activities/components/RichTextEditor';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
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
    <ScrollWrapper contextProviderName="showPageActivityContainer">
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
    </ScrollWrapper>
  );
};
