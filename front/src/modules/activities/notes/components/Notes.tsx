import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconNotes } from '@tabler/icons-react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { NoteList } from '@/activities/notes/components/NoteList';
import { useNotes } from '@/activities/notes/hooks/useNotes';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/ui/button/components/Button';
import { ActivityType } from '~/generated/graphql';

const StyledTaskGroupEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing(16)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledEmptyTaskGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledEmptyTaskGroupSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledNotesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export function Notes({ entity }: { entity: ActivityTargetableEntity }) {
  const { notes } = useNotes(entity);
  const theme = useTheme();

  const openCreateActivity = useOpenCreateActivityDrawer();

  if (notes?.length === 0) {
    return (
      <StyledTaskGroupEmptyContainer>
        <StyledEmptyTaskGroupTitle>No note yet</StyledEmptyTaskGroupTitle>
        <StyledEmptyTaskGroupSubTitle>Create one:</StyledEmptyTaskGroupSubTitle>
        <Button
          icon={<IconNotes size={theme.icon.size.sm} />}
          title="New note"
          variant={ButtonVariant.Secondary}
          onClick={() => openCreateActivity(ActivityType.Note, [entity])}
        />
      </StyledTaskGroupEmptyContainer>
    );
  }

  return (
    <StyledNotesContainer>
      <NoteList
        title="All"
        notes={notes ?? []}
        button={
          <Button
            icon={<IconNotes size={theme.icon.size.md} />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            title="Add note"
            onClick={() => openCreateActivity(ActivityType.Note, [entity])}
          ></Button>
        }
      />
    </StyledNotesContainer>
  );
}
