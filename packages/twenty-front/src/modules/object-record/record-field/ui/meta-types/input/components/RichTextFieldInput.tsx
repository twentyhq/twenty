import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useOpenRichTextInSidePanel } from '@/side-panel/hooks/useOpenRichTextInSidePanel';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';

import { type FieldRichTextV2Metadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { styled } from '@linaria/react';
import { Suspense, lazy, useContext, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { IconLayoutSidebarLeftCollapse } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledContainer = styled.div`
  background-color: ${themeCssVariables.background.primary};
  box-sizing: border-box;
  display: flex;
  margin: 0 0 0 calc(-1 * ${themeCssVariables.spacing[5]});
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[12]};
  position: relative;
  width: 480px;
`;

const StyledCollapseButton = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
`;

const LoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
    </SkeletonTheme>
  );
};
export const RichTextFieldInput = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const targetableObject = {
    id: recordId,
    targetObjectNameSingular: (
      fieldDefinition as {
        metadata: FieldRichTextV2Metadata;
      }
    ).metadata.objectMetadataNameSingular as
      | CoreObjectNameSingular.Note
      | CoreObjectNameSingular.Task,
  };

  const { openRichTextInSidePanel } = useOpenRichTextInSidePanel();
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const { onEscape, onClickOutside } = useContext(FieldInputEventContext);

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    onClickOutside?.({ event, skipPersist: true });
  };

  const handleEscape = () => {
    onEscape?.({ skipPersist: true });
  };

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: containerRef,
    inputValue: null,
    onClickOutside: handleClickOutside,
    onEscape: handleEscape,
  });

  return (
    <StyledContainer ref={containerRef}>
      <Suspense fallback={<LoadingSkeleton />}>
        <ActivityRichTextEditor
          activityId={targetableObject.id}
          activityObjectNameSingular={targetableObject.targetObjectNameSingular}
        />
      </Suspense>
      <StyledCollapseButton>
        <FloatingIconButton
          Icon={IconLayoutSidebarLeftCollapse}
          size="small"
          onClick={() => {
            onEscape?.({ skipPersist: true });
            openRichTextInSidePanel(
              targetableObject.id,
              targetableObject.targetObjectNameSingular,
            );
          }}
        />
      </StyledCollapseButton>
    </StyledContainer>
  );
};
