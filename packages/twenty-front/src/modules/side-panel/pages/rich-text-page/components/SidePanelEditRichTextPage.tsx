import { viewableRichTextComponentState } from '@/side-panel/pages/rich-text-page/states/viewableRichTextComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const RichTextFieldEditor = lazy(() =>
  import('@/object-record/record-field/ui/meta-types/input/components/RichTextFieldEditor').then(
    (module) => ({
      default: module.RichTextFieldEditor,
    }),
  ),
);

const StyledContainer = styled.div`
  box-sizing: border-box;
  margin: ${themeCssVariables.spacing[4]} -8px;
  padding-inline: 44px 0px;
  width: 100%;
`;

const LoadingSkeleton = () => {
  return <Skeleton height={SKELETON_HEIGHT_SIZES.s} />;
};

const isActivityObject = (
  objectNameSingular: string,
): objectNameSingular is
  | CoreObjectNameSingular.Note
  | CoreObjectNameSingular.Task =>
  objectNameSingular === CoreObjectNameSingular.Note ||
  objectNameSingular === CoreObjectNameSingular.Task;

export const SidePanelEditRichTextPage = () => {
  const { recordId, objectNameSingular, fieldName } = useAtomStateValue(
    viewableRichTextComponentState,
  );

  return (
    <StyledContainer>
      <Suspense fallback={<LoadingSkeleton />}>
        {isActivityObject(objectNameSingular) ? (
          <ActivityRichTextEditor
            activityId={recordId}
            activityObjectNameSingular={objectNameSingular}
          />
        ) : (
          <RichTextFieldEditor
            recordId={recordId}
            objectNameSingular={objectNameSingular}
            fieldName={fieldName}
          />
        )}
      </Suspense>
    </StyledContainer>
  );
};
