import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { NoteList } from '@/activities/notes/components/NoteList';
import { type Note } from '@/activities/types/Note';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

const StyledNotesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

type NotesCardContentProps = {
  isFetchingMore: boolean;
  notes: Note[];
  onCreateNote: (() => void) | undefined;
  onLastRowVisible: () => Promise<void>;
};

export const NotesCardContent = ({
  isFetchingMore,
  notes,
  onCreateNote,
  onLastRowVisible,
}: NotesCardContentProps) => {
  const isNotesEmpty = notes.length === 0;

  if (isNotesEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noNote" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No notes`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`There are no associated notes with this record.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {isDefined(onCreateNote) && (
          <Button
            Icon={IconPlus}
            title={t`New note`}
            variant="secondary"
            onClick={onCreateNote}
          />
        )}
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledNotesContainer>
      <NoteList notes={notes} />
      <CustomResolverFetchMoreLoader
        loading={isFetchingMore}
        onLastRowVisible={onLastRowVisible}
      />
    </StyledNotesContainer>
  );
};
