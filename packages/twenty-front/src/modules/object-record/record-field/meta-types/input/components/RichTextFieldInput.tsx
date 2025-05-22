import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useRichTextCommandMenu } from '@/command-menu/hooks/useRichTextCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import { DEFAULT_CELL_SCOPE } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { IconLayoutSidebarLeftCollapse } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

export type RichTextFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onCancel?: () => void;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
};

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

const StyledLoaderContainer = styled.div`
  height: 100px;
  width: 100%;
`;

const LoadingSkeleton = () => {
  const theme = useTheme();

  return (
    <StyledLoaderContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={theme.border.radius.sm}
      >
        <Skeleton height="100%" />
      </SkeletonTheme>
    </StyledLoaderContainer>
  );
};

export const RichTextFieldInput = ({
  targetableObject,
  onClickOutside,
  onEscape,
}: {
  targetableObject: Pick<ActivityTargetableObject, 'id'> & {
    targetObjectNameSingular:
      | CoreObjectNameSingular.Note
      | CoreObjectNameSingular.Task;
  };
} & RichTextFieldInputProps) => {
  const { editRichText } = useRichTextCommandMenu();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    onClickOutside?.(() => {}, event);
  };

  const handleEscape = () => {
    onEscape?.(() => {});
  };

  useRegisterInputEvents({
    inputRef: containerRef,
    inputValue: null,
    onClickOutside: handleClickOutside,
    onEscape: handleEscape,
    hotkeyScope: DEFAULT_CELL_SCOPE.scope,
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
            onEscape?.(() => {});
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
