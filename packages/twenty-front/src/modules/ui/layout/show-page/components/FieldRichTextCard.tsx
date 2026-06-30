import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';
import { lazy, Suspense, useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledShowPageActivityContainer = styled.div`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[6]};
  padding-inline: 44px;
  width: 100%;
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const LoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <StyledSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={theme.border.radius.sm}
      >
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};

export const FieldRichTextCard = () => {
  const targetRecord = useTargetRecord();
  const activityBodyV2 = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: targetRecord.id,
    fieldName: 'bodyV2',
  });

  const activityObjectNameSingular = targetRecord.targetObjectNameSingular as
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;

  if (!isDefined(activityBodyV2)) {
    return <LoadingSkeleton />;
  }

  return (
    <ScrollWrapper
      componentInstanceId={`scroll-wrapper-tab-list-${targetRecord.id}`}
    >
      <StyledShowPageActivityContainer>
        <Suspense fallback={<LoadingSkeleton />}>
          <ActivityRichTextEditor
            activityId={targetRecord.id}
            activityObjectNameSingular={activityObjectNameSingular}
          />
        </Suspense>
      </StyledShowPageActivityContainer>
    </ScrollWrapper>
  );
};
