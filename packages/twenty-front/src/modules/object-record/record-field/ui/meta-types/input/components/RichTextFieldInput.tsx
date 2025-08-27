import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useRichTextCommandMenu } from '@/command-menu/hooks/useRichTextCommandMenu';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';

import { type FieldRichTextV2Metadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Suspense, lazy, useContext, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { IconLayoutSidebarLeftCollapse } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  width: 480px;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)}
    ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(12)};
  margin: 0 0 0 ${({ theme }) => theme.spacing(-5)};
  display: flex;
  box-sizing: border-box;
  position: relative;
`;

const StyledCollapseButton = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
`;

const LoadingSkeleton = () => {
  const theme = useTheme();

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

  const { editRichText } = useRichTextCommandMenu();
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
            editRichText(
              targetableObject.id,
              targetableObject.targetObjectNameSingular,
            );
          }}
        />
      </StyledCollapseButton>
    </StyledContainer>
  );
};
