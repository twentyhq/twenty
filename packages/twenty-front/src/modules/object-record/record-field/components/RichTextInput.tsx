import { ActivityRichTextEditor } from '@/activities/components/ActivityRichTextEditor';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useRichTextCommandMenu } from '@/command-menu/hooks/useRichTextCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
  FieldInputClickOutsideEvent,
  FieldInputEvent,
} from '@/object-record/record-field/types/FieldInputEvent';
import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import { IconLayoutSidebarLeftCollapse } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';

export type RichTextFieldInputProps = {
  onClickOutside?: FieldInputClickOutsideEvent;
  onCancel?: () => void;
  onEnter?: FieldInputEvent;
  onEscape?: FieldInputEvent;
};

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  width: ${({ theme }) => theme.spacing(120)};
  padding: ${({ theme }) => theme.spacing(2)};
  margin: 0 0 0 ${({ theme }) => theme.spacing(-6)};
  display: flex;
`;

const StyledCollapseButton = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
`;

export const RichTextInput = ({
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !!containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickOutside?.(() => {}, event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onEscape?.(() => {});
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <StyledContainer ref={containerRef}>
      <ActivityRichTextEditor
        activityId={targetableObject.id}
        activityObjectNameSingular={targetableObject.targetObjectNameSingular}
      />
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
